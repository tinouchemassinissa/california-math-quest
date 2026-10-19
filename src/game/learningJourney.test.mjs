import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS,journeyQuestion,createJourney,currentJourneyIndex,submitJourney,nextJourney,journeySummary,journeyStorageKey,readJourneyRecord } from './learningJourney.js';
import { verifyQuestion } from './mathEngine/verifier.js';
import { isAnswerEquivalent } from './mathEngine/answerMath.js';

function answerAndContinue(state,correct=true){const q=journeyQuestion(state.grade,currentJourneyIndex(state));return nextJourney(submitJourney(state,correct?q.correctAnswer:q.options.find(v=>!isAnswerEquivalent(v,q.correctAnswer))));}
function reachCheck(grade){let s=createJourney(grade);s=answerAndContinue(s);s=answerAndContinue(s);assert.equal(s.phase,'lesson');s=nextJourney(s);s=answerAndContinue(s);s=answerAndContinue(s);assert.equal(s.phase,'check');return s;}
test('every bounded mini-lesson item passes validation and independent arithmetic',()=>{
  let count=0;
  for(const [grade,cfg] of Object.entries(JOURNEYS))for(let i=0;i<cfg.values.length;i++){
    const q=journeyQuestion(grade,i),[a,b,c,d]=cfg.values[i];count++;
    assert.equal(verifyQuestion(q).valid,true,`${grade}:${i}`);
    assert.equal(q.options.filter(x=>isAnswerEquivalent(x,q.correctAnswer)).length,1);
    let expected;
    if(cfg.kind==='add'){expected=a+b;assert.ok(expected<=(grade==='K'?10:20));}
    if(cfg.kind==='place')expected=100*a+10*b+c;
    if(cfg.kind==='multiply')expected=i%2?b:a*b;
    if(cfg.kind==='fraction'){
      const [n,den]=String(q.correctAnswer).split('/').map(Number);
      assert.equal(n*b*d,(a*d+c*b)*(den||1));
      assert.equal(q.lessonVisual.left/q.lessonVisual.denominator,a/b);
      assert.equal(q.lessonVisual.right/q.lessonVisual.denominator,c/d);
    }else assert.equal(q.correctAnswer,expected);
  }
  assert.equal(count,60);
});
test('each grade completes the child-controlled loop without duplicate submissions',()=>{
  for(const grade of Object.keys(JOURNEYS)){
    let s=createJourney(grade);assert.equal(nextJourney(s),s);
    const q=journeyQuestion(grade,0);s=submitJourney(s,q.correctAnswer);
    assert.equal(submitJourney(s,q.correctAnswer),s);
    s=nextJourney(s);s=answerAndContinue(s);assert.equal(s.phase,'lesson');
    assert.equal(submitJourney(s,0),s);s=nextJourney(s);
    s=answerAndContinue(s);s=answerAndContinue(s);s=answerAndContinue(s);s=answerAndContinue(s);
    assert.equal(s.phase,'complete');const result=journeySummary(s,1000);
    assert.equal(result.independent,true);assert.equal(result.reviewAt,86401000);
    assert.equal(s.attempts.filter(a=>a.phase==='guided').every(a=>a.assisted),true);
  }
});
test('help and wrong answers never become independent success',()=>{
  for(const grade of Object.keys(JOURNEYS)){
    let s=reachCheck(grade);s={...s,help:true};s=answerAndContinue(s);s=answerAndContinue(s);
    assert.equal(journeySummary(s,1000).independent,false);assert.equal(journeySummary(s,1000).reviewAt,601000);
    s=reachCheck(grade);s=answerAndContinue(s,false);s=answerAndContinue(s);
    assert.equal(journeySummary(s).independent,false);
  }
});
test('two starting misses select a smaller scaffold, then return to grade practice',()=>{
  let s=createJourney('5');s=answerAndContinue(s,false);s=answerAndContinue(s,false);
  assert.equal(s.support,true);assert.equal(currentJourneyIndex(s),9);
  s=nextJourney(s);assert.equal(s.phase,'guided');assert.equal(currentJourneyIndex(s),3);
});
test('one pattern observation is not promoted to repeated evidence',()=>{
  let s=createJourney('5');let q=journeyQuestion('5',0);s=submitJourney(s,q.pattern.answer);
  assert.equal(journeySummary(s).patterns.length,0);s=nextJourney(s);q=journeyQuestion('5',1);s=submitJourney(s,q.pattern.answer);
  assert.deepEqual(journeySummary(s).patterns,['denominators-added']);
});
test('review has fresh questions and requires two independent responses',()=>{
  let s={...createJourney('3'),phase:'review'};
  assert.equal(currentJourneyIndex(s),7);s=answerAndContinue(s);s=answerAndContinue(s);
  assert.equal(s.phase,'complete');assert.equal(journeySummary(s).independent,true);
});
test('saved results are versioned and separated by learner and grade',()=>{
  assert.notEqual(journeyStorageKey('Ada','3'),journeyStorageKey('Max','3'));
  assert.notEqual(journeyStorageKey('Ada','3'),journeyStorageKey('Ada','4'));
  assert.equal(journeyStorageKey(' Ada ','3'),journeyStorageKey('ada','3'));
  for(const raw of ['{','null','{}',JSON.stringify({version:0,grade:'3'})])assert.equal(readJourneyRecord(raw,'3'),null);
  const result=journeySummary(reachCheck('3'),1000);assert.deepEqual(readJourneyRecord(JSON.stringify(result),'3'),result);
  assert.equal(readJourneyRecord(JSON.stringify(result),'4'),null);
});
test('malformed saved patterns and timestamps cannot break snapshot rendering',()=>{
  const base={version:1,grade:'3',independent:false,checks:2,completedAt:1000,reviewAt:2000,patterns:[]};
  for(const patch of [{patterns:null},{patterns:['unexpected']},{checks:3},{reviewAt:500},{completedAt:-1}])assert.equal(readJourneyRecord(JSON.stringify({...base,...patch}),'3'),null);
});
