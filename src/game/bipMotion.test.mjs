import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformWithEsbuild} from 'vite';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
const reactURL=import.meta.resolve('react');
const smoothCompiled=await transformWithEsbuild(readFileSync('src/components/SmoothBipVideo.jsx','utf8').replace("'react'",JSON.stringify(reactURL)),'SmoothBipVideo.jsx',{loader:'jsx'});
const smoothURL='data:text/javascript;base64,'+Buffer.from(smoothCompiled.code).toString('base64');
async function compile(name,extra=[]){
 let s=readFileSync('src/components/'+name+'.jsx','utf8').replace("'./SmoothBipVideo.jsx'",JSON.stringify(smoothURL)).replace("'react'",JSON.stringify(reactURL));
 for(const [from,to]of extra)s=s.replace(from,JSON.stringify(to));
 const c=await transformWithEsbuild(s,name+'.jsx',{loader:'jsx'});return import('data:text/javascript;base64,'+Buffer.from(c.code).toString('base64'));
}
const {default:JourneyBip}=await compile('JourneyBip',[["'../game/bipLessonReaction.js'",new URL('./bipLessonReaction.js',import.meta.url).href]]);
const {default:BipCompanion}=await compile('BipCompanion',[["'../audio.js'",new URL('../audio.js',import.meta.url).href]]);
async function setup(Component,props,run){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://local.test'}),old={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let listener;window.matchMedia=()=>({matches:true,addEventListener:(_,fn)=>listener=fn,removeEventListener(){}});
 const root=createRoot(document.getElementById('root'));
 try{await act(()=>root.render(React.createElement(Component,props)));await run({root,listener});}
 finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,old);}
}
test('transparent learning character keeps one local 3D frame and gesture buttons respect pause',async()=>{
 await setup(JourneyBip,{phase:'check',eventKey:1},async()=>{
  const frame=document.querySelector('iframe');assert.match(frame.getAttribute('src'),/character\/index.html/);assert.equal(document.querySelector('video'),null);
  for(const label of ['Walk','Jump','Floss','Robot dance','Antennas','Wave']){
   await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(label)).click());
   assert.equal(document.querySelector('aside').dataset.motion,'paused');assert.equal(document.querySelector('iframe'),frame);
  }
 });
});
test('arcade motion actions do not replace the canvas frame or override pause',async()=>{
 await setup(BipCompanion,{soundEnabled:false},async()=>{
  const frame=document.querySelector('iframe');
  for(const text of ['Celebrate','Fire Mode','Feed Treat','High-Five','Walk','Jump','Floss','Robot dance','Antennas']){
   await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)).click());
   assert.equal(document.querySelector('section').dataset.motion,'paused');assert.equal(document.querySelector('iframe'),frame);
  }
 });
});
test('frame completion messages require the expected source and origin',async()=>{
 const {default:Character}=await import(smoothURL);let ended=0;
 await setup(Character,{src:'/bip/gestures-v3/dance.mp4',loop:false,onEnded:()=>ended++},async()=>{
  const frame=document.querySelector('iframe');
  for(const [source,origin]of [[frame.contentWindow,'https://evil.test'],[window,'https://local.test']]){
   await act(()=>window.dispatchEvent(new window.MessageEvent('message',{source,origin,data:{type:'bip-motion-ended',gesture:'dance'}})));
  }
  assert.equal(ended,0);
  await act(()=>window.dispatchEvent(new window.MessageEvent('message',{source:frame.contentWindow,origin:'https://local.test',data:{type:'bip-motion-ended',gesture:'dance'}})));
  assert.equal(ended,1);
 });
});
