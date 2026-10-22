import {applyRobotDance} from './dance-clearance.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const host=document.getElementById('bip-stage');
const stateLabel=document.getElementById('character-state');
const pauseButton=document.getElementById('motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,model,raf=0,frameTime=0,clock=0,visible=false,ready=false,failed=false;
let voice=null,externalPaused=false;
const capture=new URLSearchParams(location.search).get('capture')==='1';
let state='idle',action=null,actionTime=0,turn=0,paused=false;
const nodes=new Map(), originals=new Map(), motionButtons=[...document.querySelectorAll('[data-gesture]')];
const durations={point:2.6,nod:2.2,encourage:2.4,rest:3.0,wave:2.6,jump:1.5,walk:3.8,celebrate:2.2,dance:5.2,antennas:3.2};
try{paused=localStorage.getItem('bip-character-paused')==='yes';}catch{}
function canMove(){return !paused&&!externalPaused&&!reduced.matches;}
function controls(){
 pauseButton.textContent=reduced.matches?'Reduced motion':externalPaused?'Paused by app':paused?'Resume motion':'Pause motion';
 pauseButton.disabled=reduced.matches||externalPaused;
 pauseButton.setAttribute('aria-pressed',String(paused||reduced.matches));
 motionButtons.forEach(b=>b.disabled=!ready||!canMove()||failed||state!=='idle');
}
function label(){const text=failed?'3D unavailable · still image':!ready?'Loading Bip…':!canMove()?'Bip · still mode':action?({point:'Let’s look here',nod:'Nice work!',encourage:'Let’s try together',rest:'A quiet moment',wave:'Hello there!',jump:'A little jump',walk:'Taking a little stroll',celebrate:'A little victory!',dance:'Robot floss!','antennas':'Antenna wiggle!'}[action]):({idle:'Drag to turn · say hello',think:'Thinking',listen:'Listening',speak:'Speaking',offline:'Waiting for your connection'}[state]||'Ready');if(stateLabel.textContent!==text)stateLabel.textContent=text;}
function restore(){
 for(const [name,o] of nodes){const b=originals.get(name);o.position.copy(b.p);o.quaternion.copy(b.q);o.scale.copy(b.s);}
}
function addRotation(name,x=0,y=0,z=0){const o=nodes.get(name);if(o)o.rotateX(x).rotateY(y).rotateZ(z);}
function pose(time,dt){
 restore();const smile=model.getObjectByName('MouthSmile'),mouth=model.getObjectByName('MouthOpen');if(smile)smile.visible=true;if(mouth)mouth.visible=false;const root=nodes.get('CTRL_Bip'),head=nodes.get('CTRL_head');
 if(root)root.rotation.z+=turn;
 if(!canMove()){label();return;}
 let a=action,u=actionTime/(durations[a]||1),e=a?Math.sin(Math.PI*Math.min(1,u))**2:1;
 const t=time;
 if(state==='speak'&&voice&&!voice.audio.paused&&!voice.audio.ended){
  const amount=voice.levels[Math.floor(voice.audio.currentTime/.03)]||0;
  if(mouth&&amount>.06){smile.visible=false;mouth.visible=true;mouth.scale.z=.28+amount*1.35;}
 }

 const blink=Math.max(0,1-Math.abs((t%5.8)-4.7)/.095);
 for(const side of ['-1','1']){
  const eye=nodes.get('CTRL_eye_'+side);
  if(eye)eye.scale.z*=1-.93*blink;
  addRotation('CTRL_antenna_'+side,.045*Math.sin(t*1.4+Number(side)),0,.025*Math.sin(t*1.7));
 }
 addRotation('CTRL_head',.012*Math.sin(t*1.3),0,.018*Math.sin(t*.8));
 addRotation('CTRL_body',0,.008*Math.sin(t*1.1),0);
 if(state==='think'){
  addRotation('CTRL_head',-.055,0,.13);
  addRotation('CTRL_arm_-1',-.28,.32,0);addRotation('CTRL_elbow_-1',-.24,0,0);
 }else if(state==='listen'){
  addRotation('CTRL_head',.025,0,-.1);
 }else if(state==='speak'){
  addRotation('CTRL_head',.025*Math.sin(t*5),0,.02*Math.sin(t*2));
  addRotation('CTRL_arm_1',-.09,-.22*(.5+.5*Math.sin(t*2)),0);
 }else if(state==='offline'){addRotation('CTRL_head',.1,0,0);}
 if(a==='point'){addRotation('CTRL_arm_-1',-.12*e,.70*e);addRotation('CTRL_head',0,0,.05*e);
 }else if(a==='nod'){addRotation('CTRL_head',.10*Math.sin(u*Math.PI*4)*e);
 }else if(a==='encourage'){addRotation('CTRL_head',.045*e,0,.07*e);
 }else if(a==='rest'){addRotation('CTRL_head',.06*e);
 }else if(a==='wave'){
  addRotation('CTRL_arm_1',-.15*e,-1.7*e,0);
  addRotation('CTRL_elbow_1',-.08*e,0,0);
  addRotation('CTRL_wrist_1',0,.25*e*Math.sin(u*Math.PI*8),0);
  addRotation('CTRL_head',0,0,-.07*e);
  for(const side of ['-1','1'])addRotation('CTRL_antenna_'+side,.10*Math.sin(u*Math.PI*6)*e,0,.08*Number(side)*e);
 }else if(a==='jump'||a==='celebrate'){
  // Anticipation, airborne arc, and a damped landing. Feet move with the root.
  const crouch=u<.22?Math.sin(u/.22*Math.PI)*.055:0;
  const flight=u>.22&&u<.77?Math.sin((u-.22)/.55*Math.PI):0;
  const landing=u>=.77?Math.sin((u-.77)/.23*Math.PI)*.035:0;
  root.position.z+=flight*.36-crouch-landing;
  addRotation('CTRL_body',.09*(crouch/.055)-.035*flight,0,0);
  addRotation('CTRL_arm_-1',0,(a==='celebrate'?1.1:.65)*e,0);
  addRotation('CTRL_arm_1',0,-(a==='celebrate'?1.1:.65)*e,0);
  addRotation('CTRL_head',-.04*flight,0,0);
 }else if(a==='dance'){
  applyRobotDance(nodes,originals,u,e);
 }else if(a==='antennas'){
  for(const side of ['-1','1']){
   const n=Number(side);
   addRotation('CTRL_antenna_'+side,.25*Math.sin(u*Math.PI*6+n*.5)*e,0,.17*n*Math.sin(u*Math.PI*4)*e);
  }
  addRotation('CTRL_head',-.035*e,0,.045*Math.sin(u*Math.PI*2)*e);
 }else if(a==='walk'){
  const cycle=u*Math.PI*8,stride=Math.sin(cycle)*.33*e;
  addRotation('CTRL_leg_-1',stride,0,0);addRotation('CTRL_leg_1',-stride,0,0);
  addRotation('CTRL_arm_-1',-stride*.55,0,0);addRotation('CTRL_arm_1',stride*.55,0,0);
  root.position.z+=Math.abs(Math.sin(cycle))*.065*e;
  root.position.x+=.28*Math.sin(u*Math.PI*2)*e;
  root.rotation.z+=.17*Math.cos(cycle)*e;
  addRotation('CTRL_body',.035*e,0,.035*Math.sin(cycle)*e);
 }
 if(a&&actionTime>=durations[a]){window.dispatchEvent(new CustomEvent('bip-motion-ended',{detail:{gesture:a}}));action=null;actionTime=0;controls();}
 label();
}
function draw(now=0){
 raf=0;
 if(!ready||failed||document.hidden||!visible)return;
 const dt=Math.min(.045,Math.max(0,(now-frameTime)/1000));frameTime=now;
 if(canMove()){clock+=dt;actionTime+=dt;}
 pose(clock,dt);renderer.render(scene,camera);
 if(canMove())raf=requestAnimationFrame(draw);
}
function wake(){if(ready&&!raf&&visible&&!document.hidden){frameTime=performance.now();raf=requestAnimationFrame(draw);}}
function fail(){
 failed=true;ready=false;cancelAnimationFrame(raf);raf=0;
 renderer?.dispose();renderer?.domElement.remove();
 host.dataset.mode='fallback';controls();label();
}
function resize(){
 if(!renderer)return;
 const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),aspect=w/h;
 renderer.setSize(w,h,false);
 const height=3.9,width=height*aspect;
 camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;
 camera.updateProjectionMatrix();wake();
}
async function init(){
 if(renderer||failed)return;
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:capture,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail();});
  scene=new THREE.Scene();
  camera=new THREE.OrthographicCamera(-2,2,2,-2,.01,50);camera.up.set(0,0,1);camera.position.set(.4,-8,3.1);camera.lookAt(0,0,1.48);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  const key=new THREE.DirectionalLight(0xffebd3,3.2);key.position.set(-3,-4,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xb0e5ff,1.5);fill.position.set(3,-2,3);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xe1f6ff,0x445653,1.3));
  const loaded=await new GLTFLoader().loadAsync(host.dataset.model||'/bip/character/bip-v3.glb');
  if(failed)return;
  model=loaded.scene;scene.add(model);
  model.traverse(o=>{if(o.name.startsWith('CTRL_')){nodes.set(o.name,o);originals.set(o.name,{p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()});}});
  for(const name of ['CTRL_Bip','CTRL_head','CTRL_arm_1','CTRL_leg_1'])if(!nodes.has(name))throw Error('Character controls missing');
  ready=true;host.dataset.mode='3d';window.dispatchEvent(new Event('bip-motion-ready'));controls();resize();label();
  if(canMove())action='wave';
  wake();
 }catch{fail();}
}
pauseButton.addEventListener('click',()=>{
 if(reduced.matches)return;
 paused=!paused;action=null;actionTime=0;
 try{localStorage.setItem('bip-character-paused',paused?'yes':'no');}catch{}
 controls();label();wake();
});
motionButtons.forEach(b=>b.addEventListener('click',()=>{
 if(!ready||!canMove()||state!=='idle')return;
 action=b.dataset.gesture;actionTime=0;controls();wake();
}));
document.getElementById('character-reset').addEventListener('click',()=>{turn=0;wake();});
let pointer=null;
host.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0)pointer={x:e.clientX,turn,id:e.pointerId};});
host.addEventListener('pointermove',e=>{if(pointer&&pointer.id===e.pointerId&&Math.abs(e.clientX-pointer.x)>5){turn=pointer.turn+(e.clientX-pointer.x)*.008;wake();}});
for(const name of ['pointerup','pointercancel','pointerleave'])host.addEventListener(name,()=>pointer=null);
window.addEventListener('bip-character-voice',e=>{voice=e.detail;});
window.addEventListener('bip-character-state',e=>{
 const next=['idle','think','listen','speak','offline'].includes(e.detail?.state)?e.detail.state:'idle';
 if(next!==state){state=next;action=null;actionTime=0;}
 if(e.detail?.gesture&&durations[e.detail.gesture]&&state==='idle'&&canMove()){action=e.detail.gesture;actionTime=0;}
 controls();label();wake();
});
reduced.addEventListener('change',()=>{action=null;controls();label();wake();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
new ResizeObserver(resize).observe(host);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){init();wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'40px'}).observe(host);
controls();label();

window.BipMotion={
 setPaused(value){externalPaused=value===true;action=null;actionTime=0;controls();label();wake();},
 play(gesture){if(!durations[gesture]||!ready||!canMove()||state!=='idle')return;action=gesture;actionTime=0;wake();}
};
if(capture)window.BipCapture={
 render(gesture,t){
  cancelAnimationFrame(raf);raf=0;paused=false;externalPaused=false;state=gesture==='think'?'think':'idle';
  action=durations[gesture]?gesture:null;actionTime=t;pose(t,0);renderer.render(scene,camera);
  return renderer.domElement.toDataURL('image/png');
 },
 ready(){return ready;}
};
