import { createQuestionLifecycle } from './questionLifecycle.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Rational, gcd, lcm } from './mathEngine/rational.js';
import { evaluateArithmetic, isAnswerEquivalent } from './mathEngine/answerMath.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { verifyQuestion } from './mathEngine/verifier.js';

const sample=()=>generateVerifiedProblem({grade:'3',standardCode:'3.OA.C.7',seed:123});
test('exponents bind before unary signs and exponent chains associate right',()=>{
  for(const [expression,answer] of [['-2^2',-4],['(-2)^2',4],['2^1^2',2],['-(-3)^2',-9],['4*-2^2',-16],['8/-2',-4]])assert.equal(evaluateArithmetic(expression).toNumber(),answer);
});
test('exact arithmetic rejects lossy inputs and never rounds intermediates silently',()=>{
  for(const n of [1.2,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>new Rational(n));
  assert.throws(()=>evaluateArithmetic('9007199254740992 - 9007199254740991'));
  assert.throws(()=>evaluateArithmetic('9007199254740991 + 1'));
  assert.equal(new Rational(9007199254740991,2).subtract(new Rational(9007199254740990,3)).toString(),'3002399751580331/2');
});
test('fraction operations agree with independent BigInt arithmetic across bounded signed operands',()=>{
  const gcd=(a,b)=>b?gcd(b,a%b):a<0n?-a:a;
  const canonical=(n,d)=>{if(d<0n){n=-n;d=-d;}const g=gcd(n,d)||1n;n/=g;d/=g;return d===1n?String(n):`${n}/${d}`;};
  for(let a=-12;a<=12;a++)for(let b=1;b<=8;b++)for(let c=-8;c<=8;c++)for(let d=1;d<=5;d++){
    const left=new Rational(a,b),right=new Rational(c,d),A=BigInt(a),B=BigInt(b),C=BigInt(c),D=BigInt(d);
    assert.equal(left.add(right).toString(),canonical(A*D+C*B,B*D));
    assert.equal(left.subtract(right).toString(),canonical(A*D-C*B,B*D));
    assert.equal(left.multiply(right).toString(),canonical(A*C,B*D));
    if(c)assert.equal(left.divide(right).toString(),canonical(A*D,B*C));
  }
});
test('malformed question payloads are rejected without throwing',()=>{
  const base=sample();
  for(const patch of [{prompt:[]},{prompt:42},{hint:{}},{explanation:[]},{options:[{},1,2,3]},{correctAnswer:true},{options:null},{options:['-1/2',1,2,3]},{options:['   ',1,2,3]}]){
    assert.doesNotThrow(()=>verifyQuestion({...base,...patch}));
    assert.equal(verifyQuestion({...base,...patch}).valid,false);
  }
});
test('verifier uses the actual answer acceptance rule for choice ambiguity',()=>{
  const base=sample();
  assert.equal(verifyQuestion({...base,prompt:'Choose the length.',correctAnswer:'2 m',options:['2 m',2,'3 m','4 m']}).valid,false);
  for(const x of ['',null,undefined])assert.equal(isAnswerEquivalent(x,x),false);
});
test('generator bounds retries and refuses nonfinite seeds',()=>{
  for(const maxVerificationAttempts of [Infinity,NaN,0,-1,1.5,101])assert.throws(()=>generateVerifiedProblem({maxVerificationAttempts}));
  for(const seed of [Infinity,NaN,'123'])assert.throws(()=>generateVerifiedProblem({seed}));
});

test('latest load wins and rapid double-submit cannot record two attempts',()=>{
  const gate=createQuestionLifecycle();
  assert.equal(gate.claim(),false);
  const old=gate.begin(), current=gate.begin();
  assert.equal(gate.publish(old),false);
  assert.equal(gate.claim(),false);
  assert.equal(gate.publish(current),true);
  assert.equal(gate.claim(),true);
  assert.equal(gate.claim(),false);
  assert.equal(gate.publish(current),false);
  assert.equal(gate.claim(),false);
  const next=gate.begin();
  assert.equal(gate.isCurrent(current),false);
  assert.equal(gate.publish(next),true);
  assert.equal(gate.claim(),true);
});

test('integer helpers reject nonfinite inputs instead of looping or rounding',()=>{
  for(const value of [Infinity,NaN,1.5,Number.MAX_SAFE_INTEGER+1]) {
    assert.throws(()=>gcd(value,2));assert.throws(()=>lcm(2,value));
  }
  assert.equal(gcd(54,24),6);assert.equal(lcm(6,8),24);
  assert.equal(lcm(0,0),0);assert.throws(()=>lcm(Number.MAX_SAFE_INTEGER,2));
});
