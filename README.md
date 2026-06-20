# Rampart

Field Instrument 036. A modular physical security field kit for authorized assessors.

Rampart is eighteen browser based instruments that share one chassis. Each module is a single self contained HTML file with no build step and no external runtime dependencies. The kit installs as a progressive web app, runs fully offline, and keeps everything on the device. It is weighted deliberately toward survey, documentation, and reporting, which is where the value to a client lives. Findings point at the fix, not the break in.

## Authorized use only

Rampart is built for work carried out inside a written authorization, on a defined scope, by people permitted to be there. Every page opens behind an acceptable use acknowledgement and carries a hazard band. The kit identifies weaknesses, measures them, and writes the remediation. It does not contain bypass, cloning, or implant tooling, and it is not an execution manual.

## The kit

The engagement reads left to right, from planning through the walk to the report and the close out.

| Mod | Name | What it does |
| --- | --- | --- |
| 01 | Tumbler | Lock anatomy and hardware grades, an inventory of your own cylinders, a keying chart, and a key-holder register. Deficient locks can be raised as findings. |
| 02 | Credential | Access credential reference and a per reader assessment that scores readers and writes the remediation. |
| 03 | Picket | The device as a field tripwire, watching motion, vibration, and sound, with a snapshot on trip and auto-calibration to ambient. |
| 04 | Safeconduct | The authorization letter, a present card with QR, a hash chained activity log, an ECDSA signed and verifiable seal, and a deadman check-in. |
| 05 | Sweep | The walking survey, with scored feature types, photo evidence, voice dictation, and findings dropped as pins on a floor plan. |
| 06 | Aether | Wireless and RF exposure reference and assessment. Identify and rate only, never transmit. |
| 07 | Docket | The report compiler. Pulls findings from across the kit, scores overall risk, builds photo and evidence appendices, frames the report from Remit and tracks remediation from Debrief, and exports the deliverable as a printable PDF, a self-contained HTML file with images inlined, JSON, or CSV. Compares against a prior assessment. |
| 08 | Footprint | Public exposure assessment, with map deep links and an exposure register. |
| 09 | Touchstone | Tap to identify a reader over NFC or Bluetooth, then hand off to Credential. Identify only, no clone. |
| 10 | Quartermaster | Readiness and loadout checklist, authorization confirmed from Safeconduct, with a gear close out and return inventory. |
| 11 | Primer | The physical attack chain, phase by phase, written for the defender, with a live finding count and a jump to each phase's module. |
| 12 | Exhibit | Tamper evident photo evidence. Timestamped, geotagged, fingerprinted, and hash chained, so an altered or missing image shows. |
| 13 | Flux | Magnetometer detector for magnetic locks, door contacts, and concealed ferrous hardware. |
| 14 | Lumen | Camera lighting meter. Relative brightness and, more usefully, uniformity, to find the dark pockets in site lighting. |
| 15 | Gauge | Reference scale measure tool for door gaps, fence heights, and standoff, taken from a photo. |
| 16 | Remit | Scope and threat model planner. Objective, modeled adversary, protected assets, and success criteria, compiled to a one page remit. |
| 17 | Debrief | Post engagement hotwash and a remediation tracker that pulls the findings from the kit and tracks each fix to done. |
| 18 | Lexicon | Doctrine and glossary reference, searchable and linked back to the module that puts each term to work. |
| 19 | Preflight | Device capability self-check. Tests the camera, sensors, crypto, and storage the device offers and reports which modules will run on it. |
| 20 | Acoustic | Relative sound level meter. Reads the ambient noise floor and frequency balance to judge masking noise and acoustic privacy. |
| 21 | Patrol | Patrol logger. Logs timestamped passes at checkpoints and surfaces predictable cadence, coverage gaps, and unwatched stations as findings. |
| 22 | Sightline | Camera coverage mapper. Places cameras on a plan, draws their fields of view, and estimates blind spots, raising coverage gaps as findings. |
| 23 | Cache | Passphrase encrypted vault. Holds sensitive notes and secrets encrypted at rest with AES-GCM, unreadable without the passphrase. |

## How an engagement flows

Plan it in Remit and confirm the loadout in Quartermaster. Fill and sign the authorization in Safeconduct, and study the public picture in Footprint. On site, work the assessment through Tumbler, Credential, Touchstone, Sweep, and Aether, measuring with Flux, Lumen, and Gauge as you go, and capturing proof in Exhibit. Drop Picket when you need eyes on a space. Compile the deliverable in Docket, then close the loop in Debrief. Primer and Lexicon sit behind the whole kit as the threat reference and the shared vocabulary.

## Running it

Rampart is static files. Serve the folder from any static host over HTTPS. HTTPS is required, because the progressive web app, the camera, NFC, geolocation, the magnetometer, and the signing all need a secure context.

To install, open the site and add it to the home screen. After that it runs offline from the cache. When you publish a change, raise the `CACHE` constant at the top of `sw.js` so installed copies refresh.

## Your data stays on the device

Nothing leaves the device. Every module stores its work in the browser's local storage, and the instruments that use the camera, microphone, or sensors process locally without recording or uploading. Backups and exports are files you choose to create and place yourself.

## Engagements

The portal is a cockpit. It treats the live working data as the active engagement and lets you keep several engagements side by side without one overwriting another. You can create, rename, and switch engagements, back one up or restore it, back up the whole kit, and wipe an engagement or the entire device when handing back a loaner. The cockpit also shows a live status: findings by severity, whether an authorization letter is on file, readiness, and last activity.

## Browser support

Best on a current mobile browser over HTTPS. Some instruments depend on hardware and browser features that vary by device. The magnetometer in Flux, NFC in Touchstone, and the ambient light sensor in Lumen are not universal, and each module tells you when a feature is unavailable rather than failing silently. Test the hardware dependent modules on your own device before relying on them in the field.

## Conventions

Single file HTML, no build step, no external runtime dependencies. Dark by default, a vintage scientific instrument aesthetic, evocative single word names, and sequential numbering. No em dashes anywhere in the kit.

## License

GPL-3.0
