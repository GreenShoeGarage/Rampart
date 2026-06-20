/* ==========================================================================
   Rampart Field Kit - shared core helpers (core.js)
   One definition of the three helpers every module used to copy: a getElementById
   shorthand, an HTML escaper, and a small JSON localStorage wrapper. Attached to
   window so module scripts can drop their local copies and share these. store.set
   returns true on success and false on failure so callers can detect a full quota.
   ========================================================================== */
(function(global){
  'use strict';
  global.$ = function(id){ return document.getElementById(id); };
  global.esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  global.store = {
    get: function(k,d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
    set: function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
  };
})(typeof window!=='undefined'?window:this);
