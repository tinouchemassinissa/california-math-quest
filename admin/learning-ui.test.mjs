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
  assert.match(document.querySelector('.journey-visual-cue').textContent,/does not describe these equal groups/);
  assert.equal(document.querySelectorAll('.guided-group-row').length,3);
  const raw=localStorage.getItem(journeyProgressKey('ui-test','3'));
  assert.equal(JSON.parse(raw).state.attempts.length,1);
  await act(async()=>root.unmount());await mount();
  assert.match(document.body.textContent,/Welcome back/);
  assert.equal(choices().every(b=>b.disabled),true);
  const next=[...document.querySelectorAll('button')].find(b=>b.textContent==='Continue →');
  await act(async()=>next.click());
  assert.match(document.querySelector('.journey-question').textContent,/20 ÷ 4/);
  assert.equal(choices().some(b=>b.disabled),false);
 }finally{
  if(root)await act(async()=>root.unmount());dom.window.close();
  for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  await rm(temp,{recursive:true,force:true});
 }
});
