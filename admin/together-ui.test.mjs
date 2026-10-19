import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {createQuestionLifecycle} from '../src/game/questionLifecycle.js';
test('solve together waits for each coordinate response and hides worked answer',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});const old={};
 for(const key of ['window','document','IS_REACT_ACT_ENVIRONMENT']){old[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 let root;
 try{
 const out=resolve(temp,'guide.mjs');await build({entryPoints:['src/components/GuidedLesson.jsx'],outfile:out,bundle:true,format:'esm',platform:'node',packages:'external'});const {default:Guide}=await import(pathToFileURL(out));
 root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Guide,{open:true,question:{id:'point',prompt:'Find the point',manipulative:{type:'coordinate',x:5,y:2},explanation:'The answer is (5, 2).'}})));
 await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Solve together')).click());
 assert.match(document.body.textContent,/How many spaces across/);assert.ok(!document.body.textContent.includes('The answer is (5, 2)'));
 const answer=async value=>act(async()=>{const input=document.querySelector('input');Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new window.Event('input',{bubbles:true}));input.dispatchEvent(new window.Event('change',{bubbles:true}));});
 // A clue must not advance the task or reveal the coordinate pair.
 await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Give me a clue').click());
 assert.match(document.querySelector('[role="status"]').textContent,/horizontal axis/);assert.match(document.body.textContent,/Your turn 1 of 3/);
 await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('Show a worked example')).click());
 assert.match(document.body.textContent,/The answer is \(5, 2\)/);
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}await rm(temp,{recursive:true,force:true});}
});
