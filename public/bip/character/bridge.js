if(new URLSearchParams(location.search).get('controls')==='none')document.documentElement.classList.add('embedded');
let pending=null;
function receive(e){
 if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='bip-motion')return;
 pending=e.data;apply();
}
function apply(){if(!pending||!window.BipMotion)return;const p=pending;pending=null;window.BipMotion.setPaused(p.paused===true);
 if(['idle','think','listen','speak','offline'].includes(p.state))window.dispatchEvent(new CustomEvent('bip-character-state',{detail:{state:p.state}}));
 if(['point','wave','jump','walk','celebrate','dance','robot','antennas','nod','encourage','rest'].includes(p.gesture))window.BipMotion.play(p.gesture);
}
window.addEventListener('message',receive);
window.addEventListener('bip-motion-ready',()=>{apply();if(parent!==window)parent.postMessage({type:'bip-motion-ready'},location.origin);});
window.addEventListener('bip-motion-ended',e=>{if(parent!==window)parent.postMessage({type:'bip-motion-ended',gesture:e.detail.gesture},location.origin);});

window.addEventListener('bip-motion-fallback',()=>{if(parent!==window)parent.postMessage({type:'bip-motion-fallback'},location.origin);});

if(new URLSearchParams(location.search).get('theme')==='light')document.documentElement.classList.add('light');
