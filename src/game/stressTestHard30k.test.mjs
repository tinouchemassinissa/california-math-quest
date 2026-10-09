import test from 'node:test';
import assert from 'node:assert/strict';
import { runHard30kStressTest } from './stressTestHard30k.mjs';

test('30,000-CYCLE HARD STRESS TEST: Interactive Geometry, Multi-Step Word Problems & Multi-Persona Simulation', async () => {
  const result = await runHard30kStressTest();

  // Verification checks
  assert.equal(result.totalRuns, 30000);
  assert.equal(result.verifiedCount, 30000);
  assert.equal(result.verificationFailures, 0);

  // Manipulatives and word problems coverage
  assert.ok(result.geometryManipulativesTested > 1000);
  assert.ok(result.wordProblemsTested > 10000);

  // Invariant assertions
  assert.equal(result.invariants.duplicateOptions, 0);
  assert.equal(result.invariants.missingCorrectOption, 0);
  assert.equal(result.invariants.nanValues, 0);
  assert.equal(result.invariants.unhandledFallbacks, 0);
  assert.equal(result.invariants.emptyStrings, 0);
  assert.equal(result.invariants.corruptedManipulatives, 0);

  // Profile integrity
  assert.equal(result.profileIntegrity.nanScores, 0);
  assert.equal(result.profileIntegrity.invalidStreaks, 0);
  assert.equal(result.profileIntegrity.corruptMastery, 0);

  // Gameplay simulation
  assert.equal(result.totalAttempts, 30000);
  assert.equal(result.standardsPracticedCount, 47);
  assert.equal(result.classroomWorksheetsValid, true);
  assert.equal(result.livesCycles.gameOversTriggered, result.livesCycles.cleanResets);
});
