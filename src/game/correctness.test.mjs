import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { evaluateArithmetic, canonicalAnswer, isAnswerEquivalent } from './mathEngine/answerMath.js';
import { verifyQuestion } from './mathEngine/verifier.js';
import { STANDARDS } from '../data/californiaCurriculum.js';
import { createInitialProfile, selectAdaptiveQuestion } from './learningEngine.js';
import { fetchEducationalQuestion } from './api/curriculumFeed.js';
import { buildLessonGuide } from './coachGuide.js';

function question(code, seed) { return generateVerifiedProblem({ grade: STANDARDS[code].grade, standardCode: code, seed }); }
function numeric(answer) { return Number(String(answer).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)[0]); }

test('arithmetic parser checks decimals, fractions and precedence without executing code', () => {
  for (const [expr, expected] of [['0.1 + 0.2','3/10'],['(3 + 5) × 4 - 3','29'],['1/3 + 1/6','1/2'],['8 × 10^2','800'],['3,000 - 1,250','1750']]) assert.equal(evaluateArithmetic(expr).toString(), expected);
  for (const expr of ['globalThis.process.exit()', '1/0', '1,2', '2**100', 'NaN']) assert.throws(() => evaluateArithmetic(expr));
});
test('answer checking accepts equivalent fractions but never silently changes a supplied unit', () => {
  assert.ok(isAnswerEquivalent('2/4','1/2')); assert.ok(isAnswerEquivalent('0.5','1/2'));
  assert.ok(isAnswerEquivalent('24','24 sq m')); assert.ok(!isAnswerEquivalent('24 ft','24 m'));
  assert.ok(!isAnswerEquivalent('24 m','24 sq m')); assert.ok(!isAnswerEquivalent('$24','24¢'));
});
test('verifier rejects mutated arithmetic, grade labels, diagrams and equivalent-choice duplicates', () => {
  const q = question('3.OA.C.7', 17);
  assert.equal(verifyQuestion({...q, grade:'2'}).valid,false);
  assert.equal(verifyQuestion({...q, prompt:'What is 7 × 8?',correctAnswer:55,options:[55,51,52,53]}).valid,false);
  assert.equal(verifyQuestion({...q,options:['1/2','2/4','3/4','1/4'],correctAnswer:'1/2'}).valid,false);
  assert.equal(verifyQuestion({...q,manipulative:{type:'tape-diagram',parts:[3,3],total:9}}).valid,false);
});
test('invalid standards and exhausted generation fail closed', () => {
  assert.throws(() => generateVerifiedProblem({grade:'3',standardCode:'5.OA.A.1'}));
  assert.throws(() => generateVerifiedProblem({grade:'99'}));
  assert.throws(() => generateVerifiedProblem({grade:'3',standardCode:'3.NF.A.1',maxVerificationAttempts:0}));
});
test('adaptive selector preserves its selected exact skill', () => {
  // Zero selects the first registered grade-3 skill. Previously a random OA skill could replace it.
  const p = createInitialProfile('3');
  assert.equal(selectAdaptiveQuestion('3',p,()=>0).standard, Object.values(STANDARDS).find(s=>s.grade==='3').code);
});
test('explicit question seed is reproducible through the content service', async () => {
  const a = await fetchEducationalQuestion({grade:'5',standardCode:'5.NF.A.1',seed:9321});
  // Clear recent-prompt effects by checking semantics from the underlying seeded generator.
  const b = question('5.NF.A.1',a.question.seed);
  assert.equal(a.question.prompt,b.prompt);assert.equal(a.question.correctAnswer,b.correctAnswer);
});
test('prime and multiple choices have exactly one mathematically correct option', () => {
  const prime=n=>n>=2 && Array.from({length:Math.max(0,Math.floor(Math.sqrt(n))-1)},(_,i)=>i+2).every(d=>n%d!==0);
  for(let seed=0;seed<600;seed++) {
    const q=question('4.OA.B.4',seed);const factor=q.prompt.match(/MULTIPLE of (\d+)/);
    const valid=q.options.filter(x=>factor ? Number(x)%Number(factor[1])===0 : prime(Number(x)));
    assert.deepEqual(valid,[q.correctAnswer]);
  }
});
test('registered shape naming, angle and classification tasks keep their own standard', () => {
  for(let seed=1;seed<=200;seed++) {
    assert.equal(question('K.G.A.2',seed).correctAnswer,question('K.G.A.2',seed).manipulative.kind);
    assert.match(question('4.MD.C.6',seed).prompt,/protractor/);
    assert.match(question('4.MD.C.7',seed).prompt,/Additive Angle/);
    assert.doesNotMatch(question('5.G.B.3',seed).prompt,/5.G.B.4/);
  }
});
test('single-digit multiplication/division includes zero and agrees with independent integer arithmetic', () => {
  const seen=new Set();
  for(let seed=1;seed<=600;seed++) {
    const q=question('3.OA.C.7',seed);const m=q.prompt.match(/What is (\d+) ([×÷]) (\d+)/);assert.ok(m);
    const a=Number(m[1]),b=Number(m[3]);assert.equal(q.correctAnswer,m[2]==='×'?a*b:a/b);
    if(m[2]==='×'){assert.ok(a<=9&&b<=9);seen.add(b);} else assert.ok(b>0);
  }
  assert.ok(seen.has(0));assert.ok(seen.has(9));
});
test('fractions, expanded decimals and geometry answers agree with independent calculations', () => {
  for(let seed=0;seed<300;seed++) {
    for(const code of ['4.NF.B.3','5.NF.A.1','5.NF.B.4']) {
      const q=question(code,seed);const m=q.prompt.match(/(\d+)\/(\d+)\s*([+×-])\s*(\d+)\/(\d+)/);
      if(m){const a=Number(m[1]),b=Number(m[2]),c=Number(m[4]),d=Number(m[5]);const [n,e]=String(q.correctAnswer).split('/').map(Number);const value=m[3]==='×'?a*c/(b*d):m[3]==='+'?a/b+c/d:a/b-c/d;assert.ok(Math.abs(n/(e||1)-value)<1e-10);}
    }
    const area=question('3.MD.C.7',seed);const [l,w]=[...area.prompt.matchAll(/(\d+) meters/g)].map(m=>Number(m[1]));assert.equal(numeric(area.correctAnswer),l*w);
    const per=question('3.MD.D.8',seed);const nums=[...per.prompt.matchAll(/(\d+) feet/g)].map(m=>Number(m[1]));assert.equal(numeric(per.correctAnswer),per.prompt.includes('Unknown Side')?nums[0]/2-nums[1]:2*(nums[0]+nums[1]));
    const volume=question('5.MD.C.5',seed);const dims=volume.manipulative;const extra=volume.prompt.match(/Section B has a volume of (\d+)/);assert.equal(numeric(volume.correctAnswer),dims.length*dims.width*dims.height+(extra?Number(extra[1]):0));
  }
});
test('all built-in samples have explanations and consistent diagram quantities', () => {
  for(const std of Object.values(STANDARDS)) for(let seed=0;seed<100;seed++) {
    const q=question(std.code,seed);assert.ok(q.explanation?.length>15,`${std.code} missing solution`);
    const m=q.manipulative;
    if(m?.type==='tape-diagram')assert.equal(m.parts.reduce((a,b)=>a+b,0),m.total);
    if(std.code==='3.NF.A.2')assert.equal(m.type,'fraction-number-line');
    assert.equal(new Set(q.options.map(canonicalAnswer)).size,4);
    const hint=buildLessonGuide(q).firstHint;assert.ok(hint);assert.ok(!hint.includes('exact answer is'));
  }
});
test('corrected fraction explanation refers to the actual denominator', () => {
  for(let seed=1;seed<=300;seed++)assert.doesNotMatch(question('3.NF.A.3',seed).explanation,/fourths\/thirds\/halves/);
});
test('bundled supplement uses recognized standards and valid diagram schema', () => {
  for(const q of JSON.parse(readFileSync('public/curriculum_supplement.json')).items)assert.equal(verifyQuestion(q).valid,true,JSON.stringify(q));
});

test('bounded fluency never produces a sum beyond its stated range', () => {
  for(let seed=0;seed<3000;seed++) for(const [code,max] of [['2.OA.B.2',20],['3.NBT.A.2',1000]]) {
    const q=question(code,seed);assert.ok(q.correctAnswer>=0&&q.correctAnswer<=max,JSON.stringify(q));
  }
});
test('standalone binary arithmetic facts in worked solutions are independently recalculated', () => {
  let checked=0;
  const number='\\d+(?:,\\d{3})*(?:\\.\\d+)?';
  const regex=new RegExp(`(${number})\\s*([+×÷−-])\\s*(${number})\\s*=\\s*(${number})`,'g');
  for(const std of Object.values(STANDARDS))for(let seed=0;seed<100;seed++) {
    const q=question(std.code,seed);const text=q.explanation;
    for(const m of text.matchAll(regex)) {
      const before=text.slice(0,m.index).trimEnd(); const after=text.slice(m.index+m[0].length).trimStart();
      // Do not interpret a fragment of a larger expression or a fraction as a complete equality.
      if(/[\d×÷*/+^−-]$/.test(before)||/^[\d×÷*/+^−-]/.test(after)||after.startsWith('/')||before.endsWith('/'))continue;
      const a=Number(m[1].replace(/,/g,'')),b=Number(m[3].replace(/,/g,'')),c=Number(m[4].replace(/,/g,''));
      const expected=m[2]==='+'?a+b:m[2]==='×'?a*b:m[2]==='÷'?a/b:a-b;
      assert.ok(Math.abs(expected-c)<1e-8,`${std.code} seed ${seed}: ${m[0]} in ${text}`);checked++;
    }
  }
  assert.ok(checked>1000,`Only ${checked} standalone equalities checked`);
});
