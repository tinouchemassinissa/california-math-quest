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
const compiled=await transformWithEsbuild(source.replace("'react'",JSON.stringify(reactURL)).replace("'../game/bipLessonReaction.js'",JSON.stringify(reactionURL)),'JourneyBip.jsx',{loader:'jsx'});
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
  await act(()=>document.querySelector('video').dispatchEvent(new window.Event('ended',{bubbles:true})));
  assert.match(document.querySelector('video').getAttribute('src'),/healthy/);assert.equal(document.querySelector('video').loop,true);
  await render({feedback:{correct:true}});assert.ok(document.querySelector('aside').classList.contains('gesture-nod'));
  await act(()=>listener({matches:true}));assert.equal(document.querySelector('aside').dataset.motion,'paused');
 }finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,previous);}
});
