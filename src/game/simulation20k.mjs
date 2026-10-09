/**
 * 20,000-Iteration Automated End-to-End Simulation & Verification Suite
 * 
 * Simulates 20,000 complete student gameplay cycles:
 * - Generates questions across all 6 grades (K-5) and all 47 CA CCSS-M standards.
 * - Passes each question through the Formal Mathematical Invariant Gate.
 * - Simulates student answers (both correct and deliberate incorrect distractors).
 * - Verifies learner profile updates, scoring engine, streak tracking, and mistake logging.
 * - Simulates classroom session recordings and worksheet data generation.
 * - Detects any mathematical anomalies, state corruption, or NaN values.
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

export async function run20kSimulation() {
  const TOTAL_RUNS = 20000;
  console.log(`Starting 20,000-Cycle Comprehensive Stress Test & Simulation...`);
  const startTime = Date.now();

  const standardsList = Object.values(STANDARDS);
  const gradesList = GRADES.map((g) => g.id);
  const difficulties = Object.keys(DIFFICULTY_PRESETS);

  let learnerProfile = createInitialProfile('3', 'golden-bears');
  let classSession = createClassSession('Simulation Cohort Alpha', 'Simulated Student A', 'golden-bears', '3');

  const stats = {
    totalRuns: TOTAL_RUNS,
    verifiedCount: 0,
    verificationFailures: 0,
    answersSimulated: {
      correct: 0,
      incorrect: 0,
    },
    standardsDistribution: {},
    gradeDistribution: {},
    difficultyDistribution: {},
    stateErrors: {
      nanScores: 0,
      invalidStreaks: 0,
      corruptMastery: 0,
      duplicateOptions: 0,
      missingCorrectOption: 0,
      invalidDistractors: 0,
      unhandledFallbacks: 0,
    },
    livesCycles: {
      gameOversTriggered: 0,
      totalResets: 0,
    },
  };

  standardsList.forEach((s) => {
    stats.standardsDistribution[s.code] = 0;
  });
  gradesList.forEach((g) => {
    stats.gradeDistribution[g] = 0;
  });

  let currentLives = 3;
  let currentStreak = 0;

  for (let i = 0; i < TOTAL_RUNS; i += 1) {
    const seed = (i + 1) * 6271 + 9973;

    // Cycle uniformly across standards and grades
    const standard = standardsList[i % standardsList.length];
    const difficulty = difficulties[i % difficulties.length];
    const diffInfo = DIFFICULTY_PRESETS[difficulty];

    stats.standardsDistribution[standard.code] += 1;
    stats.gradeDistribution[standard.grade] = (stats.gradeDistribution[standard.grade] || 0) + 1;
    stats.difficultyDistribution[difficulty] = (stats.difficultyDistribution[difficulty] || 0) + 1;

    // 1. Problem Generation
    const question = generateVerifiedProblem({
      grade: standard.grade,
      standardCode: standard.code,
      seed,
    });

    if (question.id && question.id.startsWith('q-dyn-') && !['3.OA.C.7', '4.NBT.B.5', '5.NBT.B.5'].includes(standard.code)) {
      stats.stateErrors.unhandledFallbacks += 1;
    }

    // 2. Formal Invariant Verification
    const verification = verifyQuestion(question);
    if (verification.valid) {
      stats.verifiedCount += 1;
    } else {
      stats.verificationFailures += 1;
      console.error(`Verification Failed at iteration ${i}:`, verification.error);
    }

    // Direct integrity checks
    const optSet = new Set(question.options.map((o) => String(o).trim().toLowerCase()));
    if (optSet.size !== 4) {
      stats.stateErrors.duplicateOptions += 1;
    }
    const correctNormalized = String(question.correctAnswer).trim().toLowerCase();
    if (!optSet.has(correctNormalized)) {
      stats.stateErrors.missingCorrectOption += 1;
    }

    // 3. Simulate Student Answer: ~60% correct, ~40% wrong
    // Pseudo-random deterministic answer choice based on seed
    const shouldAnswerCorrect = (seed % 100) < 60;
    let chosenAnswer = question.correctAnswer;
    const isCorrect = shouldAnswerCorrect;

    if (isCorrect) {
      stats.answersSimulated.correct += 1;
      currentStreak += 1;
    } else {
      stats.answersSimulated.incorrect += 1;
      currentStreak = 0;
      currentLives -= 1;

      // Pick one of the genuine distractors
      const distractors = question.options.filter(
        (o) => String(o).trim().toLowerCase() !== correctNormalized
      );
      if (distractors.length === 0) {
        stats.stateErrors.invalidDistractors += 1;
      }
      chosenAnswer = distractors[(seed % distractors.length)] || distractors[0];
    }

    // 4. Learning & Scoring Engine Simulation
    const timeSpentMs = 1500 + (seed % 4000);
    const earnedPoints = isCorrect ? calculatePoints(currentStreak, difficulty) : 0;

    if (Number.isNaN(earnedPoints) || earnedPoints < 0) {
      stats.stateErrors.nanScores += 1;
    }

    // Update Learner Profile
    learnerProfile = updateLearnerProfile(learnerProfile, question.standard, isCorrect);

    if (Number.isNaN(learnerProfile.totalAttempts) || Number.isNaN(learnerProfile.totalCorrect)) {
      stats.stateErrors.nanScores += 1;
    }
    if (learnerProfile.currentStreak < 0 || Number.isNaN(learnerProfile.currentStreak)) {
      stats.stateErrors.invalidStreaks += 1;
    }
    const standardStats = learnerProfile.standards[question.standard];
    if (standardStats && (standardStats.mastery < 0 || standardStats.mastery > 1 || Number.isNaN(standardStats.mastery))) {
      stats.stateErrors.corruptMastery += 1;
    }

    // 5. Classroom Attempt Logging Simulation (every 10 attempts to keep memory bounded)
    if (i % 10 === 0) {
      classSession = recordClassroomAttempt(classSession, {
        questionId: question.id,
        standard: question.standard,
        grade: question.grade,
        domain: question.domain,
        chosenAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: earnedPoints,
        timeSpentMs,
      });
    }

    // 6. Lives & Game-Over State Handling
    if (currentLives <= 0) {
      stats.livesCycles.gameOversTriggered += 1;
      currentLives = 3; // Game restarted
      stats.livesCycles.totalResets += 1;
    }

    // Periodic progress output
    if ((i + 1) % 5000 === 0) {
      console.log(`[Progress] Completed ${i + 1} / ${TOTAL_RUNS} iterations...`);
    }
  }

  // 7. Verify Classroom Export Workbook Data Generation
  const worksheets = buildClassroomWorksheets(classSession);
  const hasValidWorksheets =
    Array.isArray(worksheets) &&
    worksheets.length === 3 &&
    worksheets.some((s) => s.name === 'Learner Performance');

  const durationMs = Date.now() - startTime;
  console.log(`Done! 20,000 cycles completed in ${durationMs}ms (${(TOTAL_RUNS / (durationMs / 1000)).toFixed(1)} ops/sec).`);

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
    classroomWorksheetsValid: hasValidWorksheets,
  };
}

if (process.argv[1]?.endsWith('simulation20k.mjs')) {
  run20kSimulation().then((res) => {
    console.log('\n--- SIMULATION RESULTS SUMMARY ---');
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error('Simulation encountered fatal error:', err);
    process.exit(1);
  });
}
