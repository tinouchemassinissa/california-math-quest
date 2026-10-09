import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createClassSession,
  recordClassroomAttempt,
  buildClassroomWorksheets,
} from './classroomSession.js';

test('createClassSession creates a structured session with Cambrian school info', () => {
  const session = createClassSession({
    teacherName: 'Mr. Davis',
    className: 'Fammatre Grade 3',
    schoolId: 'fammatre',
  });

  assert.ok(session.sessionId.startsWith('CAMB-'));
  assert.equal(session.teacherName, 'Mr. Davis');
  assert.equal(session.schoolName, 'Fammatre Elementary');
  assert.equal(session.schoolMascot, 'Falcons');
  assert.deepEqual(session.attempts, []);
});

test('recordClassroomAttempt logs attempt details accurately', () => {
  let session = createClassSession();
  session = recordClassroomAttempt(session, {
    studentName: 'Maya',
    grade: '3',
    standard: '3.OA.C.7',
    prompt: 'What is 7 × 8?',
    studentAnswer: '56',
    correctAnswer: '56',
    isCorrect: true,
    responseTimeSec: 3.4,
    points: 125,
  });

  assert.equal(session.attempts.length, 1);
  const item = session.attempts[0];
  assert.equal(item.studentName, 'Maya');
  assert.equal(item.isCorrect, true);
  assert.equal(item.points, 125);
});

test('buildClassroomWorksheets constructs 3 worksheets for Excel', () => {
  let session = createClassSession({
    teacherName: 'Mrs. Patel',
    schoolId: 'steindorf',
  });
  session = recordClassroomAttempt(session, {
    studentName: 'Ethan',
    grade: '5',
    standard: '5.OA.A.1',
    prompt: 'Evaluate: (4 + 2) × 3',
    studentAnswer: '18',
    correctAnswer: '18',
    isCorrect: true,
    responseTimeSec: 4.2,
    points: 150,
  });

  const worksheets = buildClassroomWorksheets(session);
  assert.equal(worksheets.length, 3);
  assert.equal(worksheets[0].name, 'Session Summary');
  assert.equal(worksheets[1].name, 'Student Roster & Accuracy');
  assert.equal(worksheets[2].name, 'Detailed Item Log');

  // Verify rows are populated
  assert.ok(worksheets[0].rows.length > 5);
  assert.ok(worksheets[1].rows.length >= 2);
  assert.ok(worksheets[2].rows.length >= 2);
});
