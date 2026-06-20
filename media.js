/* ==========================================================================
   Rampart Field Kit - media store (media.js)
   IndexedDB backed blob store for photos and evidence, so large images live
   outside localStorage and never overflow its quota. Blob ids are global and
   unique, prefixed mda_, so kit.js can find an engagement's media by scanning
   its records for the pattern. Exposes window.RampartMedia.
   ========================================================================== */
(function(global){
  'use strict';
  var DB='rampart-media', STORE='blobs', VER=1;
  var dbp=null;

  function open(){
    if(dbp) return dbp;
    dbp=new Promise(function(res,rej){
      if(!global.indexedDB){ rej(new Error('no indexedDB')); return; }
      var r=global.indexedDB.open(DB,VER);
      r.onupgradeneeded=function(){ var db=r.result; if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      r.onsuccess=function(){ res(r.result); };
      r.onerror=function(){ rej(r.error); };
    });
    return dbp;
  }
  function write(fn){
    return open().then(function(db){
      return new Promise(function(res,rej){
        var t=db.transaction(STORE,'readwrite'); fn(t.objectStore(STORE));
        t.oncomplete=function(){ res(); };
        t.onerror=function(){ rej(t.error); };
        t.onabort=function(){ rej(t.error); };
      });
    });
  }
  function read(id){
    return open().then(function(db){
      return new Promise(function(res){
        var r=db.transaction(STORE,'readonly').objectStore(STORE).get(id);
        r.onsuccess=function(){ res(r.result!==undefined?r.result:null); };
        r.onerror=function(){ res(null); };
      });
    });
  }
  function uid(){ return 'mda_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
  var ID_RE=/mda_[a-z0-9]+/g;

  var Media={
    available:function(){ return !!global.indexedDB; },
    pattern:function(){ return /mda_[a-z0-9]+/g; },
    put:function(dataURL){ var id=uid(); return write(function(st){ st.put(dataURL,id); }).then(function(){ return id; }); },
    get:function(id){ if(!id) return Promise.resolve(null); return read(id); },
    del:function(ids){ ids=Array.isArray(ids)?ids:[ids]; return write(function(st){ ids.forEach(function(id){ if(id) st.delete(id); }); }); },
    keys:function(){
      return open().then(function(db){ return new Promise(function(res){
        var r=db.transaction(STORE,'readonly').objectStore(STORE).getAllKeys();
        r.onsuccess=function(){ res(r.result||[]); }; r.onerror=function(){ res([]); };
      }); });
    },
    dump:function(ids){
      var self=this;
      return Promise.all((ids||[]).map(function(id){ return self.get(id).then(function(v){ return [id,v]; }); }))
        .then(function(pairs){ var o={}; pairs.forEach(function(p){ if(p[1]!=null) o[p[0]]=p[1]; }); return o; });
    },
    load:function(map){ if(!map) return Promise.resolve(); return write(function(st){ Object.keys(map).forEach(function(id){ st.put(map[id],id); }); }); },
    clear:function(){ return write(function(st){ st.clear(); }); }
  };
  // scan a string (typically a localStorage value) for media ids
  Media.idsIn=function(str){ if(!str) return []; var m=String(str).match(ID_RE); return m?m.filter(function(v,i,a){ return a.indexOf(v)===i; }):[]; };

  global.RampartMedia=Media;
})(typeof window!=='undefined'?window:this);
