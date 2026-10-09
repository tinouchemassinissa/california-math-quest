import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createClassSession,
  recordClassroomAttempt,
  buildClassroomWorksheets,
} from './classroomSession.js';

test('createClassSession creates a structured session with California league info', () => {
  const session = createClassSession({
    leaderName: 'Ms. Taylor',
    groupName: 'Grade 3 Math Club',
    leagueId: 'golden-bears',
  });

  assert.ok(session.sessionId.startsWith('CA-MATH-'));
  assert.equal(session.leaderName, 'Ms. Taylor');
  assert.equal(session.groupName, 'Grade 3 Math Club');
  assert.equal(session.leagueName, 'California Golden Bears');
  assert.deepEqual(session.attempts, []);
});

test('recordClassroomAttempt logs attempt details accurately', () => {
  let session = createClassSession();
  session = recordClassroomAttempt(session, {
    studentName: 'Lucas',
    grade: '3',
    standard: '3.OA.C.7',
    prompt: 'What is 8 × 9?',
    studentAnswer: '72',
    correctAnswer: '72',
    isCorrect: true,
    responseTimeSec: 3.1,
    points: 125,
  });

  assert.equal(session.attempts.length, 1);
  const item = session.attempts[0];
  assert.equal(item.studentName, 'Lucas');
  assert.equal(item.isCorrect, true);
  assert.equal(item.points, 125);
  assert.equal(item.cluster, 'Multiply and divide within 100');
});

test('buildClassroomWorksheets constructs 3 worksheets for Excel', () => {
  let session = createClassSession({
    leaderName: 'Mr. Chen',
    leagueId: 'silicon-innovators',
  });
  session = recordClassroomAttempt(session, {
    studentName: 'Sophie',
    grade: '5',
    standard: '5.OA.A.1',
    prompt: 'Evaluate: (5 + 3) × 2',
    studentAnswer: '16',
    correctAnswer: '16',
    isCorrect: true,
    responseTimeSec: 4.0,
    points: 150,
  });

  const worksheets = buildClassroomWorksheets(session);
  assert.equal(worksheets.length, 3);
  assert.equal(worksheets[0].name, 'Session Summary');
  assert.equal(worksheets[1].name, 'Learner Performance');
  assert.equal(worksheets[2].name, 'Detailed Item Log');

  assert.ok(worksheets[0].rows.length > 5);
  assert.ok(worksheets[1].rows.length >= 2);
  assert.ok(worksheets[2].rows.length >= 2);
});
