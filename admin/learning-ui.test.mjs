import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {journeyProgressKey} from '../src/game/learningJourney.js';

test('child UI resumes a lesson and exposes a useful picture after a mistake',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));
 const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});
 const previous={};for(const key of ['window','document','localStorage','IS_REACT_ACT_ENVIRONMENT']){previous[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 dom.window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
 dom.window.HTMLMediaElement.prototype.pause=function(){};
 let root;
 try{
  const output=resolve(temp,'lesson.mjs');
  await build({entryPoints:['src/components/LearningJourney.jsx'],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
  const {default:Lesson}=await import(pathToFileURL(output));
  const props={grade:'3',studentName:'Synthetic learner',learnerId:'ui-test',onClose(){}};
  const mount=async()=>{root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Lesson,props)));};
  await mount();
  const choices=()=>[...document.querySelectorAll('.journey-choice')];
  // 3 × 4: choosing 7 is the known "added the operands" mistake.
  await act(async()=>choices().find(b=>b.textContent==='7').click());
  assert.equal(document.querySelector('.journey-visual-cue'),null);
  assert.equal(document.querySelector('.journey-worked'),null);
  const raw=localStorage.getItem(journeyProgressKey('ui-test','3'));
  assert.equal(JSON.parse(raw).state.attempts.length,1);
  await act(async()=>root.unmount());await mount();
  assert.match(document.body.textContent,/Welcome back/);
  assert.equal(choices().every(b=>b.disabled),true);
  assert.match(document.body.textContent,/Not quite yet/);
  const find=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
  assert.equal(document.querySelector('.journey-coaching-step'),null);
  await act(async()=>find('↻ Try again').click());
  await act(async()=>choices().find(b=>b.textContent==='12').click());
  assert.match(document.body.textContent,/You found it after another try/);
  assert.equal(JSON.parse(localStorage.getItem(journeyProgressKey('ui-test','3'))).state.attempts.length,1);
  assert.equal(JSON.parse(localStorage.getItem(journeyProgressKey('ui-test','3'))).state.attempts[0].correct,false);
  await act(async()=>find('💛 Break it down with Bip').click());
  assert.match(document.querySelector('.journey-coaching-step').textContent,/STEP 1 OF 3/);
  assert.ok(!document.querySelector('.journey-coaching-step').textContent.includes('3 × 4 = 12'));
  await act(async()=>find('Show next step →').click());
  assert.match(document.querySelector('.journey-coaching-step').textContent,/STEP 2 OF 3/);
  await act(async()=>find('Show next step →').click());
  assert.match(document.querySelector('.journey-coaching-step').textContent,/3 × 4 = 12/);
  const next=find('Next question →');
  await act(async()=>next.click());
  assert.match(document.querySelector('.journey-question').textContent,/20 ÷ 4/);
  assert.equal(choices().some(b=>b.disabled),false);
 }finally{
  if(root)await act(async()=>root.unmount());dom.window.close();
  for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  await rm(temp,{recursive:true,force:true});
 }
});

test('animation holds its previous frame until loaded, ignores stale loads and respects pause',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));
 const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});
 const previous={};for(const key of ['window','document','IS_REACT_ACT_ENVIRONMENT']){previous[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 const plays=[],pauses=[];let failures=0;
 dom.window.HTMLMediaElement.prototype.play=function(){plays.push(this.getAttribute('src'));return Promise.resolve();};
 dom.window.HTMLMediaElement.prototype.pause=function(){pauses.push(this.getAttribute('src'));};
 let root;
 try{
  const output=resolve(temp,'motion.mjs');await build({entryPoints:['src/components/SmoothBipVideo.jsx'],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
  const {default:Motion}=await import(pathToFileURL(output));root=createRoot(document.getElementById('root'));
  const render=async props=>act(async()=>root.render(React.createElement(Motion,{onError:()=>failures++,...props})));
  await render({src:'idle.mp4',eventKey:'a',paused:false,loop:true});
  await act(async()=>document.querySelector('video').dispatchEvent(new dom.window.Event('loadeddata')));
  await render({src:'wave.mp4',eventKey:'b',paused:false});
  assert.equal(document.querySelector('video.is-visible').getAttribute('src'),'idle.mp4');
  const stale=[...document.querySelectorAll('video')].find(v=>v.getAttribute('src')==='wave.mp4');
  await render({src:'point.mp4',eventKey:'c',paused:true});
  await act(async()=>stale.dispatchEvent(new dom.window.Event('loadeddata')));
  assert.equal(document.querySelector('video.is-visible').getAttribute('src'),'idle.mp4');
  const point=[...document.querySelectorAll('video')].find(v=>v.getAttribute('src')==='point.mp4');
  await act(async()=>point.dispatchEvent(new dom.window.Event('loadeddata')));
  assert.equal(document.querySelector('video.is-visible').getAttribute('src'),'point.mp4');
  assert.ok(!plays.includes('point.mp4'));assert.ok(pauses.includes('idle.mp4'));
  await render({src:'point.mp4',eventKey:'c',paused:false});assert.ok(plays.includes('point.mp4'));
  assert.equal(document.querySelectorAll('video[aria-hidden="false"]').length,1);
  await act(async()=>{point.dispatchEvent(new dom.window.Event('error'));point.dispatchEvent(new dom.window.Event('error'));});assert.equal(failures,1);
  Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
  const playCount=plays.length;await act(async()=>document.dispatchEvent(new dom.window.Event('visibilitychange')));assert.equal(plays.length,playCount);
  await render({src:'point.mp4',eventKey:'c',paused:true});
  Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
  await act(async()=>document.dispatchEvent(new dom.window.Event('visibilitychange')));assert.equal(plays.length,playCount);
 }finally{
  if(root)await act(async()=>root.unmount());dom.window.close();
  for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  await rm(temp,{recursive:true,force:true});
 }
});
