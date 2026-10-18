import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARDS, GRADES, PROGRAM_INFO } from '../data/californiaCurriculum.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { verifyQuestion } from './mathEngine/verifier.js';

test('Cambrian School District & California CCSS-M Program Alignment Check', () => {
  assert.ok(
    PROGRAM_INFO.district.includes('Cambrian School District'),
    'PROGRAM_INFO should explicitly include Cambrian School District alignment'
  );
  assert.ok(
    PROGRAM_INFO.coreCurriculum.includes('Eureka Math'),
    'PROGRAM_INFO should explicitly include Eureka Math (A Story of Units)'
  );
  const leagueIds = new Set(PROGRAM_INFO.leagues.map((l) => l.id));
  assert.ok(leagueIds.has('bagby-barracudas'), 'Should include Bagby Elementary Barracudas');
  assert.ok(leagueIds.has('fammatre-falcons'), 'Should include Fammatre Elementary Falcons');
  assert.ok(leagueIds.has('farnham-flyers'), 'Should include Farnham Elementary Flyers');
  assert.ok(leagueIds.has('sartorette-superstars'), 'Should include Sartorette Elementary Superstars');
  assert.ok(leagueIds.has('steindorf-steam'), 'Should include Steindorf STEAM Makers');
  assert.ok(leagueIds.has('golden-bears'), 'Should preserve California Golden Bears');
});

test('100,000-Question Exhaustive Mathematical, Pedagogical & Kid-Safety Verification Audit across all 82 CA Standards', () => {
  const allStandards = Object.values(STANDARDS);
  assert.equal(allStandards.length, 82, 'Must have exactly 82 official K-5 California CCSS-M standards');

  const TOTAL_QUESTIONS = 100000;
  const perStandardCount = Math.ceil(TOTAL_QUESTIONS / allStandards.length); // 1,220 per standard => 100,040 questions
  let totalGenerated = 0;
  const standardCounts = {};

  for (const std of allStandards) {
    standardCounts[std.code] = 0;
    for (let i = 0; i < perStandardCount; i += 1) {
      const seed = totalGenerated + 1001;
      const q = generateVerifiedProblem({
        grade: std.grade,
        standardCode: std.code,
        mode: i % 5 === 0 ? 'word-problems' : i % 7 === 0 ? 'manipulatives' : 'grade-quest',
        seed,
      });

      const check = verifyQuestion(q);
      if (!check.valid) {
        assert.fail(
          `Invariant failure on standard ${std.code} (seed ${seed}): ${check.errors.join('; ')} | Question: ${JSON.stringify(q)}`
        );
      }

      // Verify exact 4 unique options and inclusion of correctAnswer
      assert.equal(q.options.length, 4, `Standard ${std.code} must have 4 options`);
      const normSet = new Set(q.options.map((o) => String(o).trim().toLowerCase()));
      assert.equal(normSet.size, 4, `Standard ${std.code} options must be 100% distinct: ${JSON.stringify(q.options)}`);
      assert.ok(
        normSet.has(String(q.correctAnswer).trim().toLowerCase()),
        `Standard ${std.code} options must include correctAnswer (${q.correctAnswer})`
      );

      totalGenerated += 1;
      standardCounts[std.code] += 1;
    }
  }

  assert.ok(
    totalGenerated >= 100000,
    `Expected at least 100,000 verified questions, generated ${totalGenerated}`
  );

  for (const g of GRADES) {
    const stdsForGrade = allStandards.filter((s) => s.grade === g.id);
    assert.ok(stdsForGrade.length >= 6, `Grade ${g.id} must have comprehensive standard coverage`);
  }
});
