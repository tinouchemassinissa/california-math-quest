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
test('retry explicitly rearms the same question once and stale loads remain invalid',()=>{
 const life=createQuestionLifecycle();assert.equal(life.retry(),false);const token=life.begin();life.publish(token);assert.equal(life.retry(),false);assert.equal(life.claim(),true);assert.equal(life.claim(),false);assert.equal(life.retry(),true);assert.equal(life.retry(),false);assert.equal(life.claim(),true);const next=life.begin();assert.equal(life.retry(),false);assert.equal(life.publish(token),false);assert.equal(life.publish(next),true);
});
test('arcade mistake hides answer reveal and offers retry, guided breakdown or next',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});const old={};
 for(const key of ['window','document','localStorage','IS_REACT_ACT_ENVIRONMENT']){old[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});window.HTMLMediaElement.prototype.pause=function(){};window.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 let root,retries=0,next=0;
 try{
  const out=resolve(temp,'card.mjs');await build({entryPoints:['src/components/QuestionCard.jsx'],outfile:out,bundle:true,format:'esm',platform:'node',packages:'external'});const {default:Card}=await import(pathToFileURL(out));
  const question={id:'retry-fraction',grade:'5',standard:'5.NF.A.1',title:'Subtract fractions',prompt:'Calculate 2/5 - 3/10.',correctAnswer:'1/10',options:['1/2','3/5','1/3','1/10'],explanation:'Rename 2/5 as 4/10. Then 4/10 - 3/10 = 1/10.',hint:'Use equal-sized pieces.',manipulative:{type:'fraction',numerator:1,denominator:10}};
  const props={question,onAnswer(){},onRetry(){retries++;},onNextAfterAnswer(){next++;},feedback:{status:'incorrect',answer:'1/2'},showHints:true,soundEnabled:false};root=createRoot(document.getElementById('root'));
  const render=async extra=>act(async()=>root.render(React.createElement(Card,{...props,...extra})));
  await render();const find=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
  assert.equal(document.querySelector('.correct-reveal'),null);assert.equal(document.querySelector('.explanation-callout'),null);assert.equal(document.querySelector('.fraction-strip'),null);assert.doesNotMatch(document.body.textContent,/The correct answer is/);assert.ok(!document.body.textContent.includes(question.explanation));assert.equal(document.querySelector('.bip-guide'),null);
  await act(async()=>find('↻ Try again').click());assert.equal(retries,1);await render({feedback:null});assert.equal(document.querySelectorAll('.kid-option-btn:disabled').length,0);
  await render({feedback:{status:'incorrect',answer:'3/5'}});await act(async()=>find('💛 Break it down with Bip').click());assert.ok(document.querySelector('.bip-guide'));assert.ok(!document.body.textContent.includes(question.explanation));assert.equal(document.querySelector('.correct-reveal'),null);
  await act(async()=>document.querySelector('.bip-guide-actions .btn-primary').click());await act(async()=>document.querySelector('.bip-guide-actions .btn-primary').click());assert.ok(document.querySelector('.bip-guide-work'));
  await act(async()=>document.querySelector('[aria-label="Close learning guide"]').click());await act(async()=>find('💛 Break it down with Bip').click());assert.equal(document.querySelector('.bip-guide-work'),null);
  await act(async()=>find('Next question →').click());assert.equal(next,1);
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}await rm(temp,{recursive:true,force:true});}
});
