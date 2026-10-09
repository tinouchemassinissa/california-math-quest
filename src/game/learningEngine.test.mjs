import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialProfile,
  updateLearnerProfile,
  getMistakeReviewStandards,
  calculatePoints,
  getProgressSummary,
  computeAchievements,
} from './learningEngine.js';

test('createInitialProfile initializes default student profile', () => {
  const profile = createInitialProfile('2', 'golden-bears');
  assert.equal(profile.grade, '2');
  assert.equal(profile.league, 'golden-bears');
  assert.equal(profile.totalAttempts, 0);
  assert.equal(profile.currentStreak, 0);
  assert.deepEqual(profile.standards, {});
});

test('updateLearnerProfile updates mastery and streaks accurately', () => {
  let profile = createInitialProfile('3', 'redwood-explorers');
  const now = 1700000000000;

  profile = updateLearnerProfile(profile, '3.OA.C.7', true, now);
  assert.equal(profile.totalAttempts, 1);
  assert.equal(profile.totalCorrect, 1);
  assert.equal(profile.currentStreak, 1);
  assert.equal(profile.standards['3.OA.C.7'].attempts, 1);
  assert.equal(profile.standards['3.OA.C.7'].correct, 1);
  assert.ok(profile.standards['3.OA.C.7'].mastery > 0);

  profile = updateLearnerProfile(profile, '3.OA.C.7', false, now + 1000);
  assert.equal(profile.totalAttempts, 2);
  assert.equal(profile.totalCorrect, 1);
  assert.equal(profile.currentStreak, 0);
  assert.equal(profile.standards['3.OA.C.7'].mistakes, 1);
});

test('getMistakeReviewStandards filters and orders standards by mistakes', () => {
  let profile = createInitialProfile('3', 'pacific-voyagers');
  profile = updateLearnerProfile(profile, '3.OA.C.7', false);
  profile = updateLearnerProfile(profile, '3.OA.C.7', false);
  profile = updateLearnerProfile(profile, '3.NF.A.1', false);

  const mistakeCodes = getMistakeReviewStandards(profile, '3');
  assert.equal(mistakeCodes[0], '3.OA.C.7');
  assert.equal(mistakeCodes[1], '3.NF.A.1');
});

test('calculatePoints handles streak and difficulty multiplier', () => {
  const novicePts = calculatePoints(0, 'novice');
  const masterPts = calculatePoints(0, 'master');
  assert.ok(masterPts > novicePts);

  const streakPts = calculatePoints(6, 'intermediate');
  const zeroStreakPts = calculatePoints(0, 'intermediate');
  assert.ok(streakPts > zeroStreakPts);
});

test('getProgressSummary and computeAchievements evaluate unlocked badges', () => {
  let profile = createInitialProfile('K', 'golden-bears');
  let achievements = computeAchievements(profile);
  assert.equal(achievements[0].unlocked, false);

  profile = updateLearnerProfile(profile, 'K.CC.B.4', true);
  achievements = computeAchievements(profile);
  assert.equal(achievements[0].unlocked, true);
});
