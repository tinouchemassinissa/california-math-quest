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
test('interactive fraction, counter, symmetry and area models check and reset safely',async()=>{
 const temp=await mkdtemp(resolve('.bip-ui-test-'));const dom=new JSDOM('<div id="root"></div>',{url:'https://bip.test'});const old={};
 for(const key of ['window','document','IS_REACT_ACT_ENVIRONMENT']){old[key]=globalThis[key];globalThis[key]=key==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[key];}
 window.HTMLMediaElement.prototype.pause=function(){};window.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 let root;
 try{
 const out=resolve(temp,'models.mjs');await build({entryPoints:['src/components/VisualMathActivity.jsx'],outfile:out,bundle:true,format:'esm',platform:'node',packages:'external'});const {default:Model}=await import(pathToFileURL(out));
 root=createRoot(document.getElementById('root'));
 const render=async activity=>act(async()=>root.render(React.createElement(Model,{key:activity,activity})));
 const click=async label=>act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent===label).click());
 const cell=async label=>act(async()=>document.querySelector('[aria-label="'+label+'"]').click());
 await render('shade');await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/numerator/);
 for(let i=1;i<=3;i++)await cell('Fraction part '+i);
 await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/Yes!/);assert.ok(document.querySelector('.lab-feedback-success .gesture-nod'));
 await click('Start model again');assert.equal(document.querySelectorAll('[aria-pressed="true"]').length,0);
 await render('counters');await cell('Counter 1');await act(async()=>document.querySelectorAll('.counter-board section')[1].querySelector('.btn').click());
 assert.equal(document.querySelectorAll('.counter-board section')[1].querySelectorAll('.counter-piece').length,1);
 await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/tray/);
 await render('symmetry');
 for(const label of ['Mirror row 1, column 6','Mirror row 1, column 5','Mirror row 2, column 5','Mirror row 3, column 4','Mirror row 4, column 6'])await cell(label);
 await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/symmetric/);
 await render('area');await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/inside/);
 for(let y=2;y<=4;y++)for(let x=2;x<=5;x++)await cell('Area tile row '+y+', column '+x);
 await click('Check my model');assert.match(document.querySelector('[role="status"]').textContent,/area tiles fit/);
 assert.ok(document.querySelector('.lab-feedback-retry'));
 assert.match(document.querySelector('.lab-feedback h4').textContent,/Not quite yet/);
 assert.equal(document.querySelector('.lab-feedback'),document.activeElement);
 assert.equal(document.querySelector('input').getAttribute('aria-invalid'),'true');
 assert.ok(document.querySelector('.lab-feedback .gesture-encourage'));
 assert.equal(document.querySelectorAll('.filled').length,12);
 
 assert.equal(document.querySelectorAll('.filled').length,12);
 await click('Help me count outside edges');assert.equal(document.querySelectorAll('.unit-edge').length,14);
 for(const edge of [...document.querySelectorAll('.unit-edge')])await act(async()=>edge.click());
 assert.match(document.body.textContent,/14 unit edges marked/);
 await click('Next exercise →');assert.match(document.body.textContent,/Exercise 2 of 6/);
 assert.equal(document.querySelectorAll('.filled').length,0);assert.equal(document.querySelector('input').value,'');assert.equal(document.querySelector('.unit-edge'),null);
 await click('Help me count outside edges');assert.equal(document.querySelectorAll('.unit-edge').length,8);
 await render('shade');await click('Next exercise →');assert.match(document.body.textContent,/Make 1\/2/);assert.equal(document.querySelectorAll('.visual-cell-grid button').length,2);
 
 }finally{if(root)await act(async()=>root.unmount());dom.window.close();for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}await rm(temp,{recursive:true,force:true});}
});
