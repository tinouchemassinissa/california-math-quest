import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyCatalog,journeyQuestion} from './learningJourney.js';
import {mistakeCoaching} from './mistakeCoaching.js';
test('every registered lesson question has three bounded steps ending in its checked explanation',()=>{
 let count=0;
 for(const grade of ['K','1','2','3','4','5'])for(const config of journeyCatalog(grade))for(let i=0;i<config.values.length;i++){
  const q=journeyQuestion(grade,i,config.id),steps=mistakeCoaching(q,config,grade);count++;
  assert.equal(steps.length,3);assert.equal(steps[2].text,q.explanation);
  for(const step of steps){assert.ok(step.title.length>4);assert.ok(step.text.length>20);assert.ok(!/undefined|NaN/.test(step.text));}
  if(config.kind==='fraction'){
   assert.ok(steps[0].text.includes(`${q.lessonVisual.denominator} equal parts`));
   assert.ok(steps[1].text.includes(`${q.lessonVisual.left}/${q.lessonVisual.denominator}`));
   assert.match(steps[1].text,config.operation==='subtract'?/Take away/:/Combine/);
  }
  if(config.kind==='multiply')assert.match(steps[0].text,q.prompt.includes('÷')?/Share/:/Make/);
 }
 assert.equal(count,216);
});
test('zero missing parts and zero place digits get valid guidance without division or negative quantities',()=>{
 const config=journeyCatalog('K').find(c=>c.id==='make-ten');const q=journeyQuestion('K',11,'make-ten');
 assert.equal(q.correctAnswer,0);assert.match(mistakeCoaching(q,config,'K')[1].text,/Start at 10 and count up to 10/);
 const place=journeyCatalog('2').find(c=>c.id==='tens');assert.match(mistakeCoaching(journeyQuestion('2',10,'tens'),place,'2')[1].text,/worth 10/);
});
