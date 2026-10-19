import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import { journeyCatalog,journeyQuestion,createJourney,submitJourney,nextJourney,currentJourneyIndex,journeySummary,journeyStorageKey,readJourneyRecord } from './learningJourney.js';
import {isAnswerEquivalent} from './mathEngine/answerMath.js';
import {bipLessonReaction} from './bipLessonReaction.js';

test('all 180 fixed lesson items match independent arithmetic and visual quantities',()=>{
 let count=0;
 for(const grade of ['K','1','2','3','4','5']){
  const lessons=journeyCatalog(grade);assert.equal(lessons.length,3);
  for(const cfg of lessons)for(let i=0;i<cfg.values.length;i++){
   const q=journeyQuestion(grade,i,cfg.id),[a,b,c,d]=cfg.values[i];count++;
   let expected;
   if(cfg.kind==='add')expected=a+b;
   if(cfg.kind==='subtract'){expected=a-b;assert.equal(q.lessonVisual.a-q.lessonVisual.b,expected);}
   if(cfg.kind==='missing')expected=b;
   if(cfg.kind==='place')expected=cfg.focus==='tens'?10*b:cfg.focus==='hundreds'?100*a:100*a+10*b+c;
   if(cfg.kind==='multiply'){const divide=cfg.operation==='divide'||(!cfg.operation&&i%2===1);expected=divide?b:a*b;assert.equal(q.lessonVisual.groups*q.lessonVisual.each,a*b);}
   if(cfg.kind==='fraction'){
    const subtract=cfg.operation==='subtract';const [n,den=1]=String(q.correctAnswer).split('/').map(Number);
    assert.equal(n*b*d,(a*d+(subtract?-c*b:c*b))*den);
    assert.equal(q.lessonVisual.operation,subtract?'-':'+');
    assert.equal(q.lessonVisual.left*b,a*q.lessonVisual.denominator);
    assert.equal(q.lessonVisual.right*d,c*q.lessonVisual.denominator);
   }else assert.equal(q.correctAnswer,expected);
   assert.equal(q.options.filter(v=>isAnswerEquivalent(v,q.correctAnswer)).length,1);
  }
 }
 assert.equal(count,180);
});
test('all eighteen paths complete and keep lesson records separate',()=>{
 for(const grade of ['K','1','2','3','4','5'])for(const cfg of journeyCatalog(grade)){
  let s=createJourney(grade,cfg.id);
  for(let guard=0;s.phase!=='complete'&&guard<10;guard++){
   if(s.phase==='lesson'){s=nextJourney(s);continue;}
   const q=journeyQuestion(grade,currentJourneyIndex(s),cfg.id);s=nextJourney(submitJourney(s,q.correctAnswer));
  }
  assert.equal(s.phase,'complete');const result=journeySummary(s,1000);assert.equal(result.independent,true);
  assert.deepEqual(readJourneyRecord(JSON.stringify(result),grade,cfg.id),result);
  assert.equal(readJourneyRecord(JSON.stringify(result),grade,'unrelated'),null);
 }
 assert.notEqual(journeyStorageKey('Ada','3','multiply'),journeyStorageKey('Ada','3','divide'));
});
test('Bip reacts to feedback, help and completion with existing local clips',()=>{
 const cases=[{phase:'diagnostic'},{phase:'lesson'},{phase:'check',help:true},{phase:'check',feedback:{correct:true}},{phase:'check',feedback:{correct:false}},{phase:'complete'}];
 const seen=new Set();
 for(const input of cases){const reaction=bipLessonReaction(input);assert.ok(existsSync(new URL(`../../public/bip/${reaction.clip}`,import.meta.url)));assert.ok(reaction.label.length>0);assert.ok(!/critical|temperature_warning/.test(reaction.clip));seen.add(reaction.gesture);}
 assert.equal(seen.size,5);
});
