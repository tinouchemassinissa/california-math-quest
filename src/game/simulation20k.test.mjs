import test from 'node:test';
import assert from 'node:assert/strict';
import { run20kSimulation } from './simulation20k.mjs';

test('20,000-CYCLE E2E STRESS TEST: Complete Game Loop, Invariant Verification, and Profile State Integrity', async () => {
  const result = await run20kSimulation();

  // Verification invariants
  assert.equal(result.totalRuns, 20000);
  assert.equal(result.verifiedCount, 20000);
  assert.equal(result.verificationFailures, 0);

  // Math Invariant Gate checks
  assert.equal(result.stateErrors.duplicateOptions, 0);
  assert.equal(result.stateErrors.missingCorrectOption, 0);
  assert.equal(result.stateErrors.invalidDistractors, 0);
  assert.equal(result.stateErrors.unhandledFallbacks, 0);

  // Profile and State Integrity
  assert.equal(result.stateErrors.nanScores, 0);
  assert.equal(result.stateErrors.invalidStreaks, 0);
  assert.equal(result.stateErrors.corruptMastery, 0);

  // Gameplay Simulation
  assert.equal(result.totalAttempts, 20000);
  assert.equal(result.totalCorrect, 12000);
  assert.equal(result.standardsPracticedCount, 47);
  assert.equal(result.classroomWorksheetsValid, true);
  assert.ok(result.livesCycles.gameOversTriggered > 0);
  assert.equal(result.livesCycles.gameOversTriggered, result.livesCycles.totalResets);
});
