/* Rampart acceptable-use gate. Shows once per device until acknowledged. */
(function(){
  var KEY='rampart.acknowledged';
  try { if(localStorage.getItem(KEY)) return; } catch(e){}

  function build(){
    if(document.getElementById('rampart-gate')) return;

    var css = ''+
      '#rampart-gate{position:fixed;inset:0;z-index:9999;background:rgba(10,12,14,0.92);'+
      'display:flex;align-items:center;justify-content:center;padding:20px;'+
      'font-family:"IBM Plex Sans",system-ui,sans-serif;}'+
      '#rampart-gate .rg-card{max-width:560px;width:100%;background:var(--panel,#1d2327);'+
      'border:1px solid var(--line-2,#4c5a63);border-radius:4px;overflow:hidden;'+
      'box-shadow:0 20px 60px rgba(0,0,0,0.6);}'+
      '#rampart-gate .rg-band{font-family:"IBM Plex Mono",monospace;font-size:11px;'+
      'letter-spacing:0.3em;text-transform:uppercase;color:#1a1a14;text-align:center;padding:7px 0;'+
      'background:repeating-linear-gradient(-45deg,#d99a3c 0 18px,#15191c 18px 22px,#d99a3c 22px 40px,#15191c 40px 44px);}'+
      '#rampart-gate .rg-body{padding:26px 26px 22px;color:var(--cream,#e9e3d5);}'+
      '#rampart-gate h2{font-family:"Saira Condensed","Arial Narrow",sans-serif;font-weight:800;'+
      'font-size:30px;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 14px;color:var(--cream,#e9e3d5);}'+
      '#rampart-gate p{font-size:14.5px;line-height:1.6;color:var(--mute,#9a948a);margin:0 0 12px;}'+
      '#rampart-gate .rg-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}'+
      '#rampart-gate button{font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:0.14em;'+
      'text-transform:uppercase;padding:11px 18px;border-radius:2px;cursor:pointer;font-weight:600;}'+
      '#rampart-gate .rg-accept{background:var(--rust,#c25b3a);color:#181210;border:1px solid var(--rust,#c25b3a);}'+
      '#rampart-gate .rg-accept:hover{background:var(--amber,#d99a3c);border-color:var(--amber,#d99a3c);}'+
      '#rampart-gate .rg-decline{background:none;color:var(--cream,#e9e3d5);border:1px solid var(--line-2,#4c5a63);}'+
      '#rampart-gate .rg-decline:hover{border-color:var(--rust,#c25b3a);color:var(--rust,#c25b3a);}';

    var s=document.createElement('style'); s.id='rampart-gate-style'; s.textContent=css; document.head.appendChild(s);

    var o=document.createElement('div'); o.id='rampart-gate';
    o.innerHTML =
      '<div class="rg-card">'+
        '<div class="rg-band">Authorized use only</div>'+
        '<div class="rg-body" id="rg-inner">'+
          '<h2>Before you begin</h2>'+
          '<p>Rampart is a field kit for sanctioned physical security assessment. Use it only within a written authorization and an agreed scope, and only against sites and systems you are permitted to test.</p>'+
          '<p>The kit is built to find and document weaknesses so they can be fixed. It is not for unauthorized entry, surveillance of people, or any unlawful purpose. You, the operator, carry the legal and ethical responsibility for how it is used.</p>'+
          '<p>By continuing you confirm you have authorization for the work you are doing.</p>'+
          '<div class="rg-actions">'+
            '<button class="rg-accept" id="rg-accept">I understand and accept</button>'+
            '<button class="rg-decline" id="rg-decline">Decline</button>'+
          '</div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(o);

    document.getElementById('rg-accept').onclick=function(){
      try{ localStorage.setItem(KEY, new Date().toISOString()); }catch(e){}
      o.parentNode && o.parentNode.removeChild(o);
      s.parentNode && s.parentNode.removeChild(s);
    };
    document.getElementById('rg-decline').onclick=function(){
      document.getElementById('rg-inner').innerHTML =
        '<h2>Not accepted</h2>'+
        '<p>Rampart is for authorized assessment only. Close this tab to exit.</p>';
    };
  }

  if(document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
