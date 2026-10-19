import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {journeyStorageKey,journeyProgressKey} from '../src/game/learningJourney.js';
import {saveLearner,saveWork,loadFamily} from '../src/family/familyStore.js';
test('child navigation contains no content imports or adult tools; adult tools remain in Family',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});
 const previous={};for(const key of ['window','document','localStorage','IS_REACT_ACT_ENVIRONMENT']){previous[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});window.HTMLMediaElement.prototype.pause=function(){};window.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 let root;
 const find=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
 const waitFor=async check=>{for(let i=0;i<100&&!check();i++)await act(async()=>{await new Promise(r=>setTimeout(r,5));});assert.ok(check(),document.body.textContent);};
 const click=async text=>{await waitFor(()=>find(text));await act(async()=>{find(text).click();await new Promise(r=>setTimeout(r,10));});};
 const childClean=()=>assert.doesNotMatch(document.body.textContent,/AI Vault|AI Knowledge|Teacher draft|Study Groups|Study groups & Excel|learner identifier|Delete this learner|Domain Analytics|Standards Mastered/);
 try{
  await saveLearner({id:'child-nav',name:'TestExplorer',grade:'3'});
  await saveWork({id:'keep-homework',learnerId:'child-nav',title:'Keep my page',date:'2026-10-19',status:'to-do',notes:'',lessonId:null,type:'application/pdf',filename:'page.pdf',file:new Blob(['%PDF-test'])});
  const output=resolve(temp,'app.mjs');await build({entryPoints:['src/App.jsx'],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
  const {default:App}=await import(pathToFileURL(output));root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(App)));
  await click('Kids’ World');await click('TestExplorer');childClean();
  await click('Play');await waitFor(()=>document.querySelector('.welcome-dashboard'));childClean();assert.doesNotMatch(document.body.textContent,/School|Teacher Review|Selected CA Skills/);
  await click('Badges');childClean();assert.match(document.body.textContent,/My badges/);await act(async()=>document.querySelector('.modal-overlay .close-btn').click());
  await click('My world');await click('Learn');await click('Equal groups and fact families');childClean();assert.equal(document.querySelector('.journey-delete'),null);assert.equal(document.querySelector('.journey-privacy'),null);
  await click('Home');await click('Home');await click('Family & Teacher Guide');await waitFor(()=>document.querySelector('.family-adult-tools'));
  assert.match(document.body.textContent,/Study groups & Excel/);assert.match(document.body.textContent,/App version & recovery/);
  const resultKey=journeyStorageKey('child-nav','3','starter'),progressKey=journeyProgressKey('child-nav','3','starter');localStorage.setItem(resultKey,'old practice');localStorage.setItem(progressKey,'unfinished practice');localStorage.setItem('other-child-record','keep');
  await click('Progress');window.confirm=()=>true;await click('Remove saved practice');await waitFor(()=>localStorage.getItem(resultKey)===null);assert.equal(localStorage.getItem(progressKey),null);assert.equal(localStorage.getItem('other-child-record'),'keep');assert.equal((await loadFamily()).works.length,1);
  await click('Study groups & Excel');assert.equal(document.querySelectorAll('.modal-overlay').length,1);assert.match(document.body.textContent,/Study groups & practice records/);
  await act(async()=>document.querySelector('.modal-overlay .close-btn').click());await click('Home');await click('Kids’ World');childClean();assert.equal(document.querySelector('.modal-overlay'),null);
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}await rm(temp,{recursive:true,force:true});}
});
test('root stacking rule does not demote modal overlays to relative positioning',async()=>{
 const css=await readFile('src/index.css','utf8');const dom=new JSDOM('<div class="app-container"><div class="modal-overlay"></div></div>');
 try{const style=dom.window.document.createElement('style');style.textContent=css;dom.window.document.head.append(style);assert.equal(dom.window.getComputedStyle(dom.window.document.querySelector('.modal-overlay')).position,'fixed');}finally{dom.window.close();}
});
