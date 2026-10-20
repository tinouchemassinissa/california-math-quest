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
test('drawing challenge builds and checks a shape, supports undo and resets activities',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});const old={};
 for(const key of ['window','document','IS_REACT_ACT_ENVIRONMENT']){old[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 window.HTMLMediaElement.prototype.pause=function(){};window.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 let root;
 try{
 const out=resolve(temp,'draw.mjs');await build({entryPoints:['src/components/DrawingChallenge.jsx'],outfile:out,bundle:true,format:'esm',platform:'node',packages:'external'});const {default:Draw}=await import(pathToFileURL(out));
 root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Draw)));
 const click=async text=>act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent===text).click());
 await click('Check my shape');assert.match(document.querySelector('[role="status"]').textContent,/Close/);
 for(const [x,y] of [[1,1],[5,1],[1,5]])await act(async()=>document.querySelector('[aria-label="Corner at column '+x+', row '+y+'"]').click());
 await click('Close shape');await click('Check my shape');assert.match(document.querySelector('[role="status"]').textContent,/You built a triangle/);assert.ok(document.querySelector('.lab-feedback-success .gesture-nod'));
 await click('Undo corner');assert.equal(document.querySelector('.shape-dot-grid button').disabled,false);
 const select=document.querySelector('select');await act(async()=>{select.value='fraction';select.dispatchEvent(new window.Event('change',{bubbles:true}));});
 assert.equal(document.querySelector('.shape-builder'),null);assert.match(document.body.textContent,/two equal-sized parts/);assert.match(document.body.textContent,/cannot automatically check/);
 assert.equal(document.querySelector('[aria-current="step"]').textContent,'Draw a rectangle for one whole.');
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}await rm(temp,{recursive:true,force:true});}
});
