# Rampart Specification

Field Instrument 036. Technical reference for the kit, kept in sync with the live system. For orientation and the module map, see the README. This document covers the architecture, the storage contract, the shared findings schema, the report ingest logic, the engagement session model, the offline layer, and the procedure for adding a module.

## Architecture

Every module is a single HTML file that links the shared stylesheet `theme.css`, loads the acceptable use gate `gate.js`, registers the service worker `sw.js`, and carries its own inline script. There is no build step, no bundler, and no external runtime dependency. State lives in the browser's `localStorage` under the `rampart.` namespace. Cross module data flow happens entirely through shared storage keys, never through imports, so any module can be opened on its own.

The portal `index.html` adds a cockpit that loads `kit.js`, the shared session, backup, and status library. The cockpit is the only place that manages engagements; the modules are unaware of the session layer and simply read and write their own keys.

## File inventory

Nineteen HTML pages: `index.html` plus the eighteen modules. Shared assets: `theme.css`, `gate.js`, `kit.js`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`. Documentation: `README.md`, `SPEC.md`.

## The acceptable use gate

`gate.js` is included in the head of every page. On first load it presents a one time acceptable use acknowledgement and records consent under `rampart.acknowledged`. This key is device level, not engagement data, and is deliberately excluded from engagement snapshots so it persists across engagement switches. It is cleared only by a full device wipe.

## Engagement session model

Implemented in `kit.js`, exposed as `window.RampartKit`. The design treats the live keys as the active working set and stores engagements as named snapshots.

The working set is every `localStorage` key beginning with `rampart.` except `rampart.acknowledged`. An engagement is a snapshot of that working set.

Metadata lives in `rampartkit.engagements` as `{ active, list:[{ id, name, created }] }`. Each engagement's snapshot lives in `rampartkit.snap.{id}` as a map of working key to raw stored value.

Switching engagements saves the current working set into the active engagement's snapshot, clears the working set, then loads the target snapshot into the working keys. Creating an engagement snapshots the current one, then clears the working set for a fresh start. Because the modules read fixed keys, swapping the working set is invisible to them.

The library also provides per engagement export and import, whole kit export and import, a per engagement wipe that clears the working set but keeps the engagement entry, and a device wipe that removes every `rampart.` and `rampartkit.` key including the acknowledgement. The cockpit status is computed from the working set: findings counts by posture across the five findings keys, whether `rampart.safeconduct.auth` carries an engagement, readiness from `rampart.quartermaster.loadout`, and the most recent activity timestamp.

## localStorage key reference

| Key | Owner | Shape |
| --- | --- | --- |
| `rampart.acknowledged` | gate.js | Device consent flag, excluded from engagements |
| `rampart.tumbler.inventory` | Tumbler | Array of recorded cylinders |
| `rampart.tumbler.chart` | Tumbler | `{ keys, doors, cells }` keying chart |
| `rampart.tumbler.keyholders` | Tumbler | Array of key-holder records |
| `rampart.tumbler.findings` | Tumbler | Findings array, locks raised as findings |
| `rampart.credential.findings` | Credential | Findings array |
| `rampart.credential.prefill` | Touchstone to Credential | Handoff of an identified reader |
| `rampart.picket.log` | Picket | Trip log, each entry may carry a snapshot |
| `rampart.safeconduct.auth` | Safeconduct | The authorization letter fields |
| `rampart.safeconduct.log` | Safeconduct | Hash chained activity log |
| `rampart.safeconduct.keys` | Safeconduct | Exported ECDSA P-256 key pair, JWK |
| `rampart.safeconduct.seal` | Safeconduct | The signed letter bundle |
| `rampart.sweep.findings` | Sweep | Findings array |
| `rampart.sweep.plan` | Sweep | `{ img, pins:[{ x, y, label, posture }] }` |
| `rampart.aether.findings` | Aether | Findings array |
| `rampart.docket.dataset` | Docket | Compiled report dataset |
| `rampart.footprint.address` | Footprint | Subject address |
| `rampart.footprint.findings` | Footprint | Findings array |
| `rampart.touchstone.log` | Touchstone | Identified reader log |
| `rampart.quartermaster.loadout` | Quartermaster | Array of categories of packable items |
| `rampart.exhibit.log` | Exhibit | Hash chained evidence entries |
| `rampart.flux.log` | Flux | Marked magnetometer readings |
| `rampart.lumen.log` | Lumen | Logged lighting readings |
| `rampart.gauge.log` | Gauge | Saved measurement sets |
| `rampart.remit.plan` | Remit | The engagement remit |
| `rampart.debrief.notes` | Debrief | Hotwash fields |
| `rampart.debrief.items` | Debrief | Remediation tracker items |
| `rampartkit.engagements` | kit.js | Engagement metadata |
| `rampartkit.snap.{id}` | kit.js | Per engagement snapshot |

Footprint and Aether also read the public map and reference data they ship inline. Primer and Debrief read the findings keys to count and pull, but own no findings key of their own. Lexicon holds no state.

## Shared findings schema

Findings emitted by Tumbler, Credential, Sweep, Aether, and Footprint share one shape so that Docket can ingest them:

```
{
  type,      // category string, e.g. "Lock", "Access credential", a Sweep feature label
  loc,       // location label
  item,      // the specific subject
  posture,   // one of: crit, weak, strong, info
  fix,       // recommended remediation
  note,      // optional context
  time,      // ISO timestamp
  photo,     // optional data URL (Sweep)
  attrs,     // optional Sweep feature attributes
  band,      // optional Aether band marker
  wire, tech // optional Credential markers
  geo        // optional location fix
}
```

Posture maps to severity as crit for critical, weak for medium, strong for reviewed and adequate, and info for informational.

## Report ingest

Docket pulls the five findings keys and normalizes them. Source attribution is inferred from the fields present, in this order:

1. `band` present, Aether.
2. `attrs` present, Sweep.
3. `wire` or `tech` present, Credential.
4. `type` equals `Lock`, Tumbler.
5. `type` matches approach, exposure, or footprint, Footprint.
6. `type` matches a Sweep feature pattern (door, perimeter, barrier, camera, gate, window, lighting, alarm, reception, mantrap, server, skylight, utility, knox), Sweep.
7. Otherwise, generic Finding.

Docket then computes a weighted risk index and band, groups findings by severity, builds a photo evidence appendix, appends the Safeconduct activity log, supports CSV export, and compares against an imported prior dataset to show resolved, persisting, and new findings. Debrief uses the same source inference to seed its remediation tracker from critical and medium findings.

## PWA and offline

`sw.js` precaches every page and shared asset under a versioned cache name and serves cache first, with an offline fallback to `index.html`. The current cache name is `rampart-v15`. The precache list must include every HTML page plus `theme.css`, `gate.js`, `kit.js`, `manifest.webmanifest`, and both icons. `manifest.webmanifest` defines the installable app. Raising the `CACHE` constant on any change is what forces installed copies to refresh.

A secure context is required for the service worker, the camera in Picket, Sweep, Exhibit, Lumen, and Gauge, NFC and Bluetooth in Touchstone, geolocation in Exhibit and Footprint, the magnetometer in Flux, and Web Crypto signing and hashing in Safeconduct and Exhibit.

## Adding a module

Number it next in sequence and give it an evocative single word name. Start from the standard chrome: the hazard band, the masthead with crumbs and the `036 · NN` plate, the `gate.js` include, the service worker registration, and a `theme.css` link. Keep it a single file with no external runtime dependency and a GPL-3.0 header comment. Store state under a `rampart.{module}.` key so it rides with engagement sessions automatically. If the module produces assessment findings, emit the shared findings schema and add its key to the Docket pull list and the Debrief pull list, and extend the Docket source inference. Add a portal card to `index.html`, add the file to the `sw.js` precache, and raise the cache version. Before delivery, grep for the em dash U+2014 and confirm zero, run a syntax check on every inline script, and confirm there are no duplicate element ids.

## License

GPL-3.0
