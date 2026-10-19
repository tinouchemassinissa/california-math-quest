import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGuidedLesson, advanceLesson } from './guidedLesson.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { isAnswerEquivalent } from './mathEngine/answerMath.js';
import { createInitialProfile, updateLearnerProfile } from './learningEngine.js';

const q=(standard,prompt,correctAnswer)=>({standard,prompt,correctAnswer,explanation:'Review the question.'});
test('equal-group lessons cover zero through nine without changing the operands',()=>{
  for(let a=0;a<=9;a++)for(let b=0;b<=9;b++){
    const lesson=buildGuidedLesson(q('3.OA.C.7',`What is ${a} × ${b}?`,a*b));
    assert.equal(lesson.kind,'groups');assert.equal(lesson.visual.groups,a);assert.equal(lesson.visual.each,b);
    assert.equal(lesson.answer,a*b);assert.equal(lesson.steps.length,3);
  }
  for(let groups=1;groups<=9;groups++)for(let each=0;each<=9;each++){
    const lesson=buildGuidedLesson(q('3.OA.C.7',`What is ${groups*each} ÷ ${groups}?`,each));
    assert.equal(lesson.kind,'groups');assert.equal(lesson.visual.groups*lesson.visual.each,groups*each);
  }
});
test('guided arithmetic refuses a mismatched answer or division by zero',()=>{
  for(const question of [q('3.OA.C.7','What is 7 × 8?',55),q('3.OA.C.7','What is 0 ÷ 0?',0)])assert.equal(buildGuidedLesson(question).trustedSteps,false);
});
test('fraction lessons preserve values across generated addition and subtraction stories',()=>{
  let reviewed=0;
  for(const [standard,grade] of [['5.NF.A.1','5'],['4.NF.B.3','4']])for(let seed=1;seed<=1000;seed++){
    const question=generateVerifiedProblem({standardCode:standard,grade,seed});
    const lesson=buildGuidedLesson(question);
    if(lesson.kind!=='fractions')continue;
    reviewed++;
    const v=lesson.visual;
    assert.ok(isAnswerEquivalent(`${v.n1}/${v.d1}`,`${v.left}/${v.denominator}`));
    assert.ok(isAnswerEquivalent(`${v.n2}/${v.d2}`,`${v.right}/${v.denominator}`));
    const top=v.operation==='-'?v.left-v.right:v.left+v.right;
    assert.ok(isAnswerEquivalent(`${top}/${v.denominator}`,question.correctAnswer));
    assert.ok(isAnswerEquivalent(lesson.answer,question.correctAnswer));
  }
  assert.ok(reviewed>=1000);
});
test('assisted practice does not increase mastery or postpone independent review',()=>{
  const now=1700000000000;
  const profile=updateLearnerProfile(createInitialProfile(),'3.OA.C.7',true,now);
  const supported=updateLearnerProfile(profile,'3.OA.C.7',true,now+1000,{assisted:true});
  assert.equal(supported.standards['3.OA.C.7'].mastery,profile.standards['3.OA.C.7'].mastery);
  assert.equal(supported.totalCorrect,profile.totalCorrect);
  assert.equal(supported.standards['3.OA.C.7'].assistedAttempts,1);
  assert.equal(Date.parse(supported.standards['3.OA.C.7'].nextReview),now+601000);
});
test('guide stops at its last stage',()=>{assert.equal(advanceLesson(2),2);assert.equal(advanceLesson(0),1);});
