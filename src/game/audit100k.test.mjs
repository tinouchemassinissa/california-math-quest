import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARDS, GRADES, PROGRAM_INFO } from '../data/californiaCurriculum.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { verifyQuestion } from './mathEngine/verifier.js';

test('Program metadata and optional local team labels are present', () => {
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

test('100,000 seeded generated items pass implemented invariants across registered skills', () => {
  const allStandards = Object.values(STANDARDS);
  assert.ok(allStandards.length >= 84, 'Registered skills include separate angle and hierarchy standards');

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

test('Bip Robot Companion Media Assets & Kid-Safe Event Mapping Check', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const bipDir = path.resolve(process.cwd(), 'public', 'bip');

  assert.ok(fs.existsSync(path.join(bipDir, 'greeting.mp4')), 'public/bip/greeting.mp4 must exist');
  assert.ok(fs.existsSync(path.join(bipDir, 'events', 'Bip_healthy_4K60.mp4')), 'Bip_healthy_4K60.mp4 must exist');
  assert.ok(fs.existsSync(path.join(bipDir, 'events', 'Bip_busy_4K60.mp4')), 'Bip_busy_4K60.mp4 must exist');
  assert.ok(fs.existsSync(path.join(bipDir, 'events', 'Bip_recovery_4K60.mp4')), 'Bip_recovery_4K60.mp4 must exist');
  assert.ok(fs.existsSync(path.join(bipDir, 'events', 'Bip_sleep_4K60.mp4')), 'Bip_sleep_4K60.mp4 must exist');
  assert.ok(fs.existsSync(path.join(bipDir, 'events', 'Bip_backup_4K60.mp4')), 'Bip_backup_4K60.mp4 must exist');

  const compCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'BipCompanion.jsx'), 'utf8');
  assert.ok(
    !compCode.includes("tryAgain: ['events/Bip_critical_4K60.mp4'"),
    'tryAgain must never use Bip_critical_4K60.mp4 so children are never frightened or shamed'
  );
});

test('Regression Check: OER Curriculum Supplement & 8x6 Classroom Rug Area Template Verification', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { learnFromFeed, getLearnedTemplates, synthesizeFromLearnedTemplate, clearVault } = await import(
    './learning/curriculumVault.js'
  );
  const { createPRNG } = await import('./mathEngine/prng.js');

  clearVault();
  const supplementRaw = fs.readFileSync(
    path.resolve(process.cwd(), 'public', 'curriculum_supplement.json'),
    'utf8'
  );
  const supplement = JSON.parse(supplementRaw);
  const stats = learnFromFeed(supplement.items);
  assert.equal(stats.ingested, supplement.items.length, 'All OER supplement items must be valid and ingested');

  // Verify that a corrupted 8x6 rug question with correctAnswer: 8 is rejected by verifyQuestion
  const badRugCheck = verifyQuestion({
    id: 'bad-rug',
    grade: '3',
    standard: '3.MD.C.7',
    title: 'Area of a Rectangle',
    prompt: 'A classroom rug is 8 feet long and 6 feet wide. What is its area in square feet?',
    correctAnswer: 8,
    options: [8, 10, 12, 15],
  });
  assert.equal(badRugCheck.valid, false, 'Verifier must reject 8x6 rug area question when correctAnswer is 8');

  // Sample inferred templates against implemented invariants; this does not certify semantics
  const templates = getLearnedTemplates();
  const prng = createPRNG(424242);
  for (const tmpl of templates) {
    for (let i = 0; i < 100; i += 1) {
      const synth = synthesizeFromLearnedTemplate(tmpl, prng);
      // A candidate outside a standard range must be rejected, not forced through.
      if (!synth) continue;
      const v = verifyQuestion(synth);
      assert.equal(
        v.valid,
        true,
        `Synthesized question from ${tmpl.standard} failed verification: ${v.error} | ${JSON.stringify(synth)}`
      );
    }
  }
  clearVault();
});


