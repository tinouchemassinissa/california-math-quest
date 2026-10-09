import test from 'node:test';
import assert from 'node:assert/strict';
import { Rational, gcd, lcm } from './mathEngine/rational.js';
import { createPRNG } from './mathEngine/prng.js';
import { verifyQuestion } from './mathEngine/verifier.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { fetchEducationalQuestion } from './api/curriculumFeed.js';

test('gcd and lcm compute exact number theory values', () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(35, 14), 7);
  assert.equal(gcd(17, 19), 1);
  assert.equal(lcm(4, 6), 12);
  assert.equal(lcm(3, 5), 15);
});

test('Rational class performs exact symbolic fraction arithmetic without float errors', () => {
  const r1 = new Rational(1, 3);
  const r2 = new Rational(1, 6);
  const sum = r1.add(r2);
  assert.equal(sum.toString(), '1/2'); // 1/3 + 1/6 = 3/6 = 1/2
  assert.equal(sum.n, 1);
  assert.equal(sum.d, 2);

  const diff = new Rational(3, 4).subtract(new Rational(1, 4));
  assert.equal(diff.toString(), '1/2');

  const prod = new Rational(2, 3).multiply(new Rational(3, 4));
  assert.equal(prod.toString(), '1/2');

  const div = new Rational(1, 2).divide(new Rational(1, 4));
  assert.equal(div.toString(), '2');
});

test('Mulberry32 PRNG is 100% deterministic with matching seeds', () => {
  const prng1 = createPRNG(48201);
  const prng2 = createPRNG(48201);

  const seq1 = [prng1.nextInt(1, 100), prng1.nextInt(1, 100), prng1.next()];
  const seq2 = [prng2.nextInt(1, 100), prng2.nextInt(1, 100), prng2.next()];

  assert.deepEqual(seq1, seq2, 'Identical seeds must produce identical numbers');
});

test('verifyQuestion formal verification gate rejects flawed questions', () => {
  // Option count != 4
  const badCount = {
    id: 'test-1',
    grade: '3',
    standard: '3.OA.C.7',
    title: 'Test',
    prompt: 'Prompt',
    correctAnswer: 5,
    options: [5, 6, 7],
  };
  assert.equal(verifyQuestion(badCount).valid, false);

  // Duplicate options
  const duplicateOptions = {
    id: 'test-2',
    grade: '3',
    standard: '3.OA.C.7',
    title: 'Test',
    prompt: 'Prompt',
    correctAnswer: 5,
    options: [5, 5, 7, 8],
  };
  assert.equal(verifyQuestion(duplicateOptions).valid, false);

  // Correct answer missing from options
  const missingCorrect = {
    id: 'test-3',
    grade: '3',
    standard: '3.OA.C.7',
    title: 'Test',
    prompt: 'Prompt',
    correctAnswer: 10,
    options: [1, 2, 3, 4],
  };
  assert.equal(verifyQuestion(missingCorrect).valid, false);

  // NaN inside options
  const nanOption = {
    id: 'test-4',
    grade: '3',
    standard: '3.OA.C.7',
    title: 'Test',
    prompt: 'Prompt',
    correctAnswer: 5,
    options: [5, NaN, 7, 8],
  };
  assert.equal(verifyQuestion(nanOption).valid, false);
});

test('STRESS TEST: generateVerifiedProblem produces 100% verified error-free questions across all grades', () => {
  const grades = ['K', '1', '2', '3', '4', '5'];
  let totalVerified = 0;

  for (const grade of grades) {
    for (let i = 0; i < 20; i += 1) {
      const q = generateVerifiedProblem({
        grade,
        seed: 100000 + i * 77 + grades.indexOf(grade) * 999,
      });

      const verification = verifyQuestion(q);
      assert.equal(verification.valid, true, `Question failed verification: ${verification.error}`);
      assert.equal(q.verified, true);
      assert.ok(q.explanation, 'Must include step-by-step mathematical explanation');
      totalVerified += 1;
    }
  }

  assert.equal(totalVerified, 120, 'All 120 generated problems must pass verification');
});

test('fetchEducationalQuestion returns verified questions in dual-mode service', async () => {
  const res = await fetchEducationalQuestion({
    grade: '4',
    standardCode: '4.OA.B.4',
    preferOnline: false,
  });

  assert.ok(res.question);
  assert.equal(res.question.grade, '4');
  assert.equal(verifyQuestion(res.question).valid, true);
});
