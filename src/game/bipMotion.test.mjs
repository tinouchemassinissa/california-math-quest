import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformWithEsbuild} from 'vite';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
const source=readFileSync('src/components/JourneyBip.jsx','utf8');
const reactionURL=new URL('./bipLessonReaction.js',import.meta.url).href;
const reactURL=import.meta.resolve('react');
const smoothCompiled=await transformWithEsbuild(readFileSync('src/components/SmoothBipVideo.jsx','utf8').replace("'react'",JSON.stringify(reactURL)),'SmoothBipVideo.jsx',{loader:'jsx'});
const smoothURL=`data:text/javascript;base64,${Buffer.from(smoothCompiled.code).toString('base64')}`;
const compiled=await transformWithEsbuild(source.replace("'./SmoothBipVideo.jsx'",JSON.stringify(smoothURL)).replace("'react'",JSON.stringify(reactURL)).replace("'../game/bipLessonReaction.js'",JSON.stringify(reactionURL)),'JourneyBip.jsx',{loader:'jsx'});
const {default:JourneyBip}=await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);
test('reduced motion, wave, feedback replay and video completion respect pause',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://local.test'});
 const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let listener;window.matchMedia=()=>({matches:true,addEventListener:(_,fn)=>{listener=fn;},removeEventListener(){}});
 window.HTMLMediaElement.prototype.play=()=>Promise.resolve();window.HTMLMediaElement.prototype.pause=()=>{};
 const root=createRoot(document.getElementById('root'));
 const render=props=>act(()=>root.render(React.createElement(JourneyBip,{phase:'check',eventKey:1,...props})));
 const click=async text=>act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)).click());
 try{
  await render();assert.equal(document.querySelector('aside').dataset.motion,'paused');
  await click('Wave');assert.equal(document.querySelector('aside').dataset.motion,'paused');assert.equal(document.querySelector('video').autoplay,false);
  await click('Animate');assert.equal(document.querySelector('aside').dataset.motion,'playing');
  await render({feedback:{correct:false}});assert.ok(document.querySelector('aside').classList.contains('gesture-encourage'));
  const clip=part=>[...document.querySelectorAll('video')].find(v=>v.getAttribute('src').includes(part));
  await act(()=>clip('encourage').dispatchEvent(new window.Event('loadeddata')));
  await act(()=>clip('encourage').dispatchEvent(new window.Event('ended',{bubbles:true})));
  await act(()=>clip('/idle').dispatchEvent(new window.Event('loadeddata')));
  assert.match(document.querySelector('video.is-visible').getAttribute('src'),/gestures\/idle/);assert.equal(document.querySelector('video.is-visible').loop,true);
  await render({feedback:{correct:true}});
  await act(()=>clip('/nod').dispatchEvent(new window.Event('error')));
  assert.ok(clip('healthy'));
  await act(()=>clip('healthy').dispatchEvent(new window.Event('error')));
  assert.equal(document.querySelector('video'),null);assert.match(document.querySelector('img').getAttribute('src'),/poster/);
  assert.ok(document.querySelector('aside').classList.contains('gesture-nod'));
  await act(()=>listener({matches:true}));assert.equal(document.querySelector('aside').dataset.motion,'paused');
 }finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,previous);}
});

const companionSource=readFileSync('src/components/BipCompanion.jsx','utf8');
const companionCompiled=await transformWithEsbuild(companionSource.replace("'./SmoothBipVideo.jsx'",JSON.stringify(smoothURL)).replace("'react'",JSON.stringify(reactURL)).replace("'../audio.js'",JSON.stringify(new URL('../audio.js',import.meta.url).href)),'BipCompanion.jsx',{loader:'jsx'});
const {default:BipCompanion,BIP_CLIPS}=await import(`data:text/javascript;base64,${Buffer.from(companionCompiled.code).toString('base64')}`);
test('arcade gesture buttons respect pause and all events use school renders',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://local.test'});
 const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let listener;window.matchMedia=()=>({matches:true,addEventListener:(_,fn)=>{listener=fn;},removeEventListener(){}});
 window.HTMLMediaElement.prototype.play=()=>Promise.resolve();window.HTMLMediaElement.prototype.pause=()=>{};
 const root=createRoot(document.getElementById('root'));
 try{
  await act(()=>root.render(React.createElement(BipCompanion,{soundEnabled:false})));
  for(const text of ['Celebrate','Fire Mode','Feed Treat','High-Five']){
   await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)).click());
   assert.equal(document.querySelector('section').dataset.motion,'paused');
   assert.equal(document.querySelector('video').autoplay,false);
  }
  await act(()=>root.render(React.createElement(BipCompanion,{soundEnabled:false,eventKey:2})));
  assert.equal(document.querySelectorAll('.bip-particle').length,0);
  await act(()=>document.querySelector('[aria-label="Resume Bip animation"]').click());
  assert.equal(document.querySelector('section').dataset.motion,'playing');
  await act(()=>listener({matches:true}));assert.equal(document.querySelector('section').dataset.motion,'paused');
  for(const [path] of Object.values(BIP_CLIPS))assert.match(path,/^gestures\//);
 }finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,previous);}
});
