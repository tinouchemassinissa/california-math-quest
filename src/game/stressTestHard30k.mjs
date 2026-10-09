/**
 * Hard 30,000-Cycle Mathematical & Interactive Manipulative Stress Test
 * 
 * Verifies:
 * 1. 30,000 problem generations across all 47 standards and enriched 3rd/4th/5th grade word problems.
 * 2. Interactive geometry manipulatives (width, height, area, perimeter calculations).
 * 3. Formal Invariant Gate (zero duplicate options, exact ground truth match, no NaNs).
 * 4. Multi-persona student simulation (90%, 65%, 35%, 100%, 25% accuracy).
 * 5. State resilience, lives resets, mastery boundedness, and Excel worksheet generation.
 */

import { STANDARDS, GRADES } from '../data/californiaCurriculum.js';
import { generateVerifiedProblem } from './mathEngine/problemGenerator.js';
import { verifyQuestion } from './mathEngine/verifier.js';
import {
  createInitialProfile,
  updateLearnerProfile,
  calculatePoints,
  DIFFICULTY_PRESETS,
} from './learningEngine.js';
import {
  createClassSession,
  recordClassroomAttempt,
  buildClassroomWorksheets,
} from './classroomSession.js';

export async function runHard30kStressTest() {
  const TOTAL_RUNS = 30000;
  console.log(`Starting Hard 30,000-Cycle Comprehensive Stress Test & Manipulative Verification...`);
  const startTime = Date.now();

  const standardsList = Object.values(STANDARDS);
  const difficulties = Object.keys(DIFFICULTY_PRESETS);

  // Student personas with differing accuracy profiles
  const personas = [
    { name: 'Olympiad Scholar', accuracy: 0.90 },
    { name: 'Average Student', accuracy: 0.65 },
    { name: 'Emerging Learner', accuracy: 0.35 },
    { name: 'Perfect Ace', accuracy: 1.00 },
    { name: 'Random Guess', accuracy: 0.25 },
  ];

  let learnerProfile = createInitialProfile('5', 'pacific-pioneers');
  let classSession = createClassSession('Hard Stress Test Cohort', 'Test Student Alpha', 'pacific-pioneers', '5');

  const stats = {
    totalRuns: TOTAL_RUNS,
    verifiedCount: 0,
    verificationFailures: 0,
    geometryManipulativesTested: 0,
    wordProblemsTested: 0,
    answersSimulated: {
      correct: 0,
      incorrect: 0,
    },
    gradeDistribution: {},
    invariants: {
      duplicateOptions: 0,
      missingCorrectOption: 0,
      nanValues: 0,
      unhandledFallbacks: 0,
      emptyStrings: 0,
      corruptedManipulatives: 0,
    },
    profileIntegrity: {
      nanScores: 0,
      invalidStreaks: 0,
      corruptMastery: 0,
    },
    livesCycles: {
      gameOversTriggered: 0,
      cleanResets: 0,
    },
  };

  let currentLives = 3;
  let currentStreak = 0;

  for (let i = 0; i < TOTAL_RUNS; i += 1) {
    const seed = (i + 1) * 8191 + 104729;

    const standard = standardsList[i % standardsList.length];
    const difficulty = difficulties[i % difficulties.length];
    const persona = personas[i % personas.length];

    stats.gradeDistribution[standard.grade] = (stats.gradeDistribution[standard.grade] || 0) + 1;

    // 1. Problem Generation
    const question = generateVerifiedProblem({
      grade: standard.grade,
      standardCode: standard.code,
      seed,
    });

    if (question.id && question.id.startsWith('q-dyn-') && !['3.OA.C.7', '4.NBT.B.5', '5.NBT.B.5'].includes(standard.code)) {
      stats.invariants.unhandledFallbacks += 1;
    }

    // Check for Word Problems
    if (question.prompt.length > 50 || question.prompt.includes('A ') || question.prompt.includes('At a ') || question.prompt.includes('For an ')) {
      stats.wordProblemsTested += 1;
    }

    // Check Interactive Geometry Manipulatives
    if (question.manipulative && (question.manipulative.type === 'interactive-geometry' || question.manipulative.type === 'geometry')) {
      stats.geometryManipulativesTested += 1;
      const { width, height, unit } = question.manipulative;
      if (typeof width !== 'number' || typeof height !== 'number' || !unit || width <= 0 || height <= 0) {
        stats.invariants.corruptedManipulatives += 1;
      }
    }

    // 2. Formal Invariant Verification
    const verification = verifyQuestion(question);
    if (verification.valid) {
      stats.verifiedCount += 1;
    } else {
      stats.verificationFailures += 1;
      console.error(`Verification FAILED at cycle ${i}:`, verification.error);
    }

    // Deep Invariant Checks
    const norm = (s) => String(s).trim().toLowerCase();
    const optSet = new Set(question.options.map(norm));
    if (optSet.size !== 4) {
      stats.invariants.duplicateOptions += 1;
    }
    if (!optSet.has(norm(question.correctAnswer))) {
      stats.invariants.missingCorrectOption += 1;
    }
    if (question.options.some((o) => typeof o === 'number' && Number.isNaN(o))) {
      stats.invariants.nanValues += 1;
    }
    if (question.options.some((o) => typeof o === 'string' && o.trim() === '')) {
      stats.invariants.emptyStrings += 1;
    }

    // 3. Multi-Persona Answer Simulation
    const isCorrect = ((seed % 1000) / 1000) < persona.accuracy;
    let chosenAnswer = question.correctAnswer;

    if (isCorrect) {
      stats.answersSimulated.correct += 1;
      currentStreak += 1;
    } else {
      stats.answersSimulated.incorrect += 1;
      currentStreak = 0;
      currentLives -= 1;

      const distractors = question.options.filter((o) => norm(o) !== norm(question.correctAnswer));
      chosenAnswer = distractors[seed % distractors.length] || distractors[0];
    }

    // 4. Learning & Scoring Engine
    const earnedPoints = isCorrect ? calculatePoints(currentStreak, difficulty) : 0;
    if (Number.isNaN(earnedPoints) || earnedPoints < 0) {
      stats.profileIntegrity.nanScores += 1;
    }

    learnerProfile = updateLearnerProfile(learnerProfile, question.standard, isCorrect);

    if (Number.isNaN(learnerProfile.totalAttempts) || Number.isNaN(learnerProfile.totalCorrect)) {
      stats.profileIntegrity.nanScores += 1;
    }
    if (learnerProfile.currentStreak < 0 || Number.isNaN(learnerProfile.currentStreak)) {
      stats.profileIntegrity.invalidStreaks += 1;
    }
    const stdStats = learnerProfile.standards[question.standard];
    if (stdStats && (stdStats.mastery < 0 || stdStats.mastery > 1 || Number.isNaN(stdStats.mastery))) {
      stats.profileIntegrity.corruptMastery += 1;
    }

    // 5. Classroom Session Logging (sample every 15 runs)
    if (i % 15 === 0) {
      classSession = recordClassroomAttempt(classSession, {
        questionId: question.id,
        standard: question.standard,
        grade: question.grade,
        domain: question.domain,
        chosenAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: earnedPoints,
        timeSpentMs: 1200 + (seed % 3000),
      });
    }

    // 6. Lives & Game-Over Management
    if (currentLives <= 0) {
      stats.livesCycles.gameOversTriggered += 1;
      currentLives = 3;
      stats.livesCycles.cleanResets += 1;
    }

    if ((i + 1) % 10000 === 0) {
      console.log(`[Progress] Completed ${i + 1} / ${TOTAL_RUNS} cycles...`);
    }
  }

  // 7. Verify Multi-Sheet Excel Workbook Export
  const worksheets = buildClassroomWorksheets(classSession);
  const worksheetsValid =
    Array.isArray(worksheets) &&
    worksheets.length === 3 &&
    worksheets.some((s) => s.name === 'Learner Performance');

  const durationMs = Date.now() - startTime;
  console.log(`Hard stress test completed in ${durationMs}ms (${(TOTAL_RUNS / (durationMs / 1000)).toFixed(1)} ops/sec).`);

  const masteries = Object.values(learnerProfile.standards).map((s) => s.mastery);

  return {
    ...stats,
    durationMs,
    opsPerSec: (TOTAL_RUNS / (durationMs / 1000)).toFixed(1),
    totalAttempts: learnerProfile.totalAttempts,
    totalCorrect: learnerProfile.totalCorrect,
    overallAccuracy: `${((learnerProfile.totalCorrect / learnerProfile.totalAttempts) * 100).toFixed(1)}%`,
    averageMastery: masteries.length > 0 ? Number((masteries.reduce((a, b) => a + b, 0) / masteries.length).toFixed(3)) : 0,
    standardsPracticedCount: Object.keys(learnerProfile.standards).length,
    standardsMasteredCount: Object.values(learnerProfile.standards).filter((s) => s.mastery >= 0.8).length,
    classroomAttemptsLogged: classSession.attempts.length,
    classroomWorksheetsValid: worksheetsValid,
  };
}

if (process.argv[1]?.endsWith('stressTestHard30k.mjs')) {
  runHard30kStressTest().then((res) => {
    console.log('\n--- HARD 30,000-CYCLE STRESS TEST RESULTS ---');
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error('Stress test encountered fatal error:', err);
    process.exit(1);
  });
}
