import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {saveLearner,loadFamily} from '../src/family/familyStore.js';
test('family transfer UI prepares a private-by-default file, saves it and previews before import',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});
 const previous={};for(const key of ['window','document','IS_REACT_ACT_ENVIRONMENT']){previous[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 let root,saved;
 try{
  window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async file=>{saved=file;},close:async()=>{}})});
  const output=resolve(temp,'transfer.mjs');await build({entryPoints:['src/components/FamilyTransfer.jsx'],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
  const {default:Transfer}=await import(pathToFileURL(output));
  const learner={id:'ui-destination',name:'Private Child',grade:'3'};await saveLearner(learner);
  const data={learners:[learner],works:[{id:'ui-work',learnerId:learner.id,title:'Groups',date:'2026-10-19',status:'reviewed',notes:'Private note',lessonId:'multiply',type:'application/pdf',filename:'private.pdf',file:new Blob(['%PDF-ui'])}],plans:[]};
  root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Transfer,{data,ids:['ui-work'],profile:learner,run:fn=>fn(),busy:false})));
  const waitFor=async check=>{for(let i=0;i<100&&!check();i++)await act(async()=>{await new Promise(r=>setTimeout(r,5));});assert.ok(check(),document.body.textContent);};
  const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
  assert.equal(document.querySelectorAll('input[type=checkbox]')[0].checked,false);
  await act(async()=>button('Prepare 1 selected').click());await waitFor(()=>button('Save to device'));await act(async()=>button('Save to device').click());await waitFor(()=>saved);
  const raw=JSON.parse(await saved.text());assert.equal(raw.works[0].notes,'');assert.equal(raw.learners[0].name,'Learner 1');assert.equal((await loadFamily()).works.length,0);
  const input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:[saved],configurable:true});await act(async()=>input.dispatchEvent(new dom.window.Event('change',{bubbles:true})));
  await act(async()=>button('Preview import').click());await waitFor(()=>button('Confirm import'));assert.match(document.body.textContent,/Review before importing/);assert.equal((await loadFamily()).works.length,0);
  await act(async()=>button('Confirm import').click());await waitFor(()=>document.body.textContent.includes('Imported on this device'));assert.equal((await loadFamily()).works.length,1);assert.match(document.body.textContent,/Imported on this device/);
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}await rm(temp,{recursive:true,force:true});}
});
