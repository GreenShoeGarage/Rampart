/* ==========================================================================
   Rampart Field Kit - shared session manager (kit.js)
   Engagements are named snapshots of the live working data. Modules keep
   using their own rampart.* keys untouched; this library swaps the working
   set in and out, and provides backup, restore, wipe, and live status.
   Loaded by the portal. Exposes window.RampartKit.
   ========================================================================== */
(function(global){
  'use strict';
  var PREFIX = 'rampart.';
  var ACK    = 'rampart.acknowledged';        // gate.js device flag, not engagement data
  var META   = 'rampartkit.engagements';      // { active, list:[{id,name,created}] }
  var SNAP   = 'rampartkit.snap.';            // SNAP+id -> { key: rawValue, ... }

  /* ---- low level ---- */
  function lsKeys(){ var a=[]; for(var i=0;i<localStorage.length;i++){ a.push(localStorage.key(i)); } return a; }
  function isWorking(k){ return k && k.indexOf(PREFIX)===0 && k!==ACK; }
  function workingKeys(){ return lsKeys().filter(isWorking); }
  function readWorking(){ var o={}; workingKeys().forEach(function(k){ o[k]=localStorage.getItem(k); }); return o; }
  function clearWorking(){ workingKeys().forEach(function(k){ localStorage.removeItem(k); }); }
  function loadWorking(obj){
    clearWorking();
    if(!obj) return;
    Object.keys(obj).forEach(function(k){ if(isWorking(k) && obj[k]!=null){ try{ localStorage.setItem(k, obj[k]); }catch(e){} } });
  }
  function getJSON(k, d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }
  function getMeta(){ return getJSON(META, null); }
  function setMeta(m){ try{ localStorage.setItem(META, JSON.stringify(m)); }catch(e){} }
  function snapKey(id){ return SNAP+id; }
  function saveSnap(id){ if(!id) return; try{ localStorage.setItem(snapKey(id), JSON.stringify(readWorking())); }catch(e){} }
  function readSnap(id){ return getJSON(snapKey(id), {}); }
  function loadSnap(id){ loadWorking(readSnap(id)); }
  function delSnap(id){ localStorage.removeItem(snapKey(id)); }
  function uid(){ return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function now(){ return new Date().toISOString(); }

  function ensureInit(){
    var m=getMeta();
    if(!m){
      var id=uid();
      m={ active:id, list:[{ id:id, name:'Engagement 1', created:now() }] };
      setMeta(m); // adopts the current working set as the first engagement
    }
    return m;
  }

  /* ---- engagement management ---- */
  function list(){ return ensureInit().list.slice(); }
  function activeId(){ return ensureInit().active; }
  function activeName(){ var m=ensureInit(); var e=m.list.filter(function(x){return x.id===m.active;})[0]; return e?e.name:null; }

  function create(name){
    var m=ensureInit();
    if(m.active) saveSnap(m.active);
    clearWorking();
    var id=uid();
    m.list.push({ id:id, name:(name&&name.trim())||('Engagement '+(m.list.length+1)), created:now() });
    m.active=id; setMeta(m);
    return id;
  }
  function switchTo(id){
    var m=ensureInit();
    if(id===m.active) return;
    if(!m.list.some(function(e){return e.id===id;})) return;
    if(m.active) saveSnap(m.active);
    loadSnap(id);
    m.active=id; setMeta(m);
  }
  function rename(id,name){
    var m=ensureInit();
    m.list.forEach(function(e){ if(e.id===id) e.name=(name&&name.trim())||e.name; });
    setMeta(m);
  }
  function remove(id){
    var m=ensureInit();
    delSnap(id);
    m.list=m.list.filter(function(e){ return e.id!==id; });
    if(m.active===id){
      clearWorking();
      m.active = m.list.length ? m.list[0].id : null;
      if(m.active) loadSnap(m.active);
    }
    setMeta(m);
  }

  /* ---- backup / restore ---- */
  function MEDIA(){ return global.RampartMedia; }
  function idsInData(dataObj){
    var ids=[]; var M=MEDIA(); if(!M) return ids;
    Object.keys(dataObj||{}).forEach(function(k){ M.idsIn(dataObj[k]).forEach(function(id){ if(ids.indexOf(id)<0) ids.push(id); }); });
    return ids;
  }
  function exportEngagement(){
    var data=readWorking();
    var base={ kind:'rampart-engagement', name:activeName()||'Engagement', exported:now(), data:data };
    var M=MEDIA(); if(!M) return Promise.resolve(base);
    return M.dump(idsInData(data)).then(function(media){ base.media=media; return base; });
  }
  function importEngagement(obj){
    if(!obj || obj.kind!=='rampart-engagement') return Promise.reject(new Error('Not a Rampart engagement file'));
    var m=ensureInit();
    if(m.active) saveSnap(m.active);
    loadWorking(obj.data||{});
    var id=uid();
    m.list.push({ id:id, name:(obj.name||'Imported')+' (restored)', created:now() });
    m.active=id; setMeta(m);
    var M=MEDIA(); if(!M || !obj.media) return Promise.resolve(id);
    return M.load(obj.media).then(function(){ return id; });
  }
  function exportAll(){
    var m=ensureInit();
    if(m.active) saveSnap(m.active);
    var snaps={}; var ids=[];
    m.list.forEach(function(e){ var s=readSnap(e.id); snaps[e.id]=s; idsInData(s).forEach(function(id){ if(ids.indexOf(id)<0) ids.push(id); }); });
    var base={ kind:'rampart-kit', exported:now(), meta:m, snapshots:snaps };
    var M=MEDIA(); if(!M) return Promise.resolve(base);
    return M.dump(ids).then(function(media){ base.media=media; return base; });
  }
  function importAll(obj){
    if(!obj || obj.kind!=='rampart-kit' || !obj.meta) return Promise.reject(new Error('Not a Rampart kit backup'));
    // remove existing engagement data + meta + working
    lsKeys().forEach(function(k){ if(k && (k.indexOf(SNAP)===0 || k===META)) localStorage.removeItem(k); });
    clearWorking();
    setMeta(obj.meta);
    var snaps=obj.snapshots||{};
    Object.keys(snaps).forEach(function(id){ try{ localStorage.setItem(snapKey(id), JSON.stringify(snaps[id])); }catch(e){} });
    if(obj.meta.active) loadSnap(obj.meta.active);
    var M=MEDIA(); if(!M || !obj.media) return Promise.resolve();
    return M.load(obj.media);
  }

  /* ---- wipe ---- */
  function wipeEngagement(){
    var ids=idsInData(readWorking());
    clearWorking();
    var M=MEDIA(); if(M && ids.length) return M.del(ids);
    return Promise.resolve();
  }
  function wipeDevice(){
    lsKeys().forEach(function(k){ if(k && (k.indexOf('rampart.')===0 || k.indexOf('rampartkit.')===0)) localStorage.removeItem(k); });
    var M=MEDIA(); if(M) return M.clear();
    return Promise.resolve();
  }

  /* ---- live status ---- */
  function allFindings(){
    var keys=['rampart.credential.findings','rampart.sweep.findings','rampart.aether.findings','rampart.footprint.findings','rampart.tumbler.findings','rampart.patrol.findings','rampart.sightline.findings'];
    var out=[];
    keys.forEach(function(k){ var a=getJSON(k,[]); if(Array.isArray(a)) out=out.concat(a); });
    return out;
  }
  function status(){
    var f=allFindings();
    var c={crit:0,weak:0,strong:0,info:0};
    var last='';
    f.forEach(function(x){ if(c[x.posture]!=null) c[x.posture]++; if(x.time && x.time>last) last=x.time; });
    var auth=getJSON('rampart.safeconduct.auth',null);
    var log=getJSON('rampart.safeconduct.log',[]);
    if(Array.isArray(log)) log.forEach(function(e){ if(e.time && e.time>last) last=e.time; });
    var loadout=getJSON('rampart.quartermaster.loadout',null);
    var packed=0, total=0;
    if(Array.isArray(loadout)) loadout.forEach(function(cat){ (cat.items||[]).forEach(function(it){ total++; if(it.packed) packed++; }); });
    var exhibit=getJSON('rampart.exhibit.log',[]); var evidence=Array.isArray(exhibit)?exhibit.length:0;
    if(Array.isArray(exhibit)) exhibit.forEach(function(e){ if(e.time && e.time>last) last=e.time; });
    var items=getJSON('rampart.debrief.items',[]); var remOpen=0, remTotal=0;
    if(Array.isArray(items)){ remTotal=items.length; items.forEach(function(i){ if(i.status!=='closed') remOpen++; }); }
    var remit=getJSON('rampart.remit.plan',null); var hasRemit=!!(remit && remit.objective);
    var hasSeal=!!getJSON('rampart.safeconduct.seal',null);
    var gauge=getJSON('rampart.gauge.log',[]); var measurements=Array.isArray(gauge)?gauge.length:0;
    var hasAuth=!!(auth && auth.eng);
    var next;
    if(!hasRemit) next='Plan the engagement in Remit';
    else if(!hasAuth) next='Fill the authorization in Safeconduct';
    else if(f.length===0) next='Run the survey';
    else if(remTotal===0) next='Compile the report in Docket';
    else if(remOpen>0) next='Track remediation in Debrief';
    else next='Engagement complete';
    return {
      engagement: activeName(),
      findings: c,
      findingsTotal: f.length,
      authorization: hasAuth,
      authName: hasAuth ? auth.eng : '',
      readiness: { packed:packed, total:total },
      lastActivity: last,
      evidence: evidence,
      remediation: { open:remOpen, total:remTotal },
      hasRemit: hasRemit,
      hasSeal: hasSeal,
      measurements: measurements,
      nextStep: next
    };
  }

  global.RampartKit = {
    list:list, activeId:activeId, activeName:activeName,
    create:create, switchTo:switchTo, rename:rename, remove:remove,
    exportEngagement:exportEngagement, importEngagement:importEngagement,
    exportAll:exportAll, importAll:importAll,
    wipeEngagement:wipeEngagement, wipeDevice:wipeDevice,
    status:status, ensureInit:ensureInit
  };
})(window);
