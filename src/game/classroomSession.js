import { downloadWorkbook } from '../export/xlsxExport.js';
import { PROGRAM_INFO, STANDARDS } from '../data/californiaCurriculum.js';

export function createClassSession({
  leaderName = 'Study Group Lead',
  groupName = 'California Math Group',
  leagueId = 'golden-bears',
  now = Date.now(),
} = {}) {
  const league = PROGRAM_INFO.leagues.find((l) => l.id === leagueId) || PROGRAM_INFO.leagues[0];
  const dateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const sessionId = `CA-MATH-${dateStr}-${randomSuffix}`;

  return {
    sessionId,
    leaderName: leaderName.trim() || 'Lead',
    groupName: groupName.trim() || 'Study Group',
    leagueId: league.id,
    leagueName: league.name,
    leagueBadge: league.badge,
    activeStudent: 'Learner 1',
    startedAt: new Date(now).toISOString(),
    endedAt: null,
    attempts: [],
  };
}

export function recordClassroomAttempt(session, {
  studentName,
  grade,
  standard,
  prompt,
  studentAnswer,
  correctAnswer,
  isCorrect,
  responseTimeSec = 0,
  points = 0,
  now = Date.now(),
}) {
  if (!session) return session;

  const stdObj = STANDARDS[standard];
  const attemptEntry = {
    id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(now).toISOString(),
    studentName: (studentName || session.activeStudent || 'Learner').trim(),
    grade: String(grade || '3'),
    standard: String(standard || '3.OA.C.7'),
    standardTitle: stdObj?.title || 'California Standard',
    cluster: stdObj?.cluster || 'CCSS-M Cluster',
    prompt: String(prompt || ''),
    studentAnswer: String(studentAnswer ?? ''),
    correctAnswer: String(correctAnswer ?? ''),
    isCorrect: Boolean(isCorrect),
    responseTimeSec: Math.round(responseTimeSec * 10) / 10,
    points: Number(points) || 0,
  };

  return {
    ...session,
    attempts: [...session.attempts, attemptEntry],
  };
}

export function buildClassroomWorksheets(session) {
  const attempts = session.attempts || [];
  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const studentMap = {};
  attempts.forEach((a) => {
    if (!studentMap[a.studentName]) {
      studentMap[a.studentName] = {
        name: a.studentName,
        attempts: 0,
        correct: 0,
        points: 0,
      };
    }
    studentMap[a.studentName].attempts += 1;
    if (a.isCorrect) studentMap[a.studentName].correct += 1;
    studentMap[a.studentName].points += a.points;
  });

  const studentRows = Object.values(studentMap).map((s) => [
    s.name,
    s.attempts,
    s.correct,
    s.attempts > 0 ? `${Math.round((s.correct / s.attempts) * 100)}%` : '0%',
    s.points,
  ]);

  // Sheet 1: Session Summary
  const summaryRows = [
    ['CALIFORNIA ELEMENTARY MATH QUEST — COMMUNITY STUDY SESSION REPORT'],
    ['Generated', new Date().toLocaleString()],
    ['Curriculum', PROGRAM_INFO.framework],
    ['Jurisdiction', PROGRAM_INFO.jurisdiction],
    [''],
    ['Session Metric', 'Value'],
    ['Session ID', session.sessionId],
    ['Study Group / Class', session.groupName],
    ['Lead / Facilitator', session.leaderName],
    ['Learning League', `${session.leagueBadge} ${session.leagueName}`],
    ['Session Started', session.startedAt],
    ['Total Active Learners', Object.keys(studentMap).length],
    ['Total Problems Attempted', totalAttempts],
    ['Total Correct', totalCorrect],
    ['Overall Accuracy', `${overallAccuracy}%`],
  ];

  // Sheet 2: Student Roster
  const rosterRows = [
    ['Learner Name', 'Questions Attempted', 'Questions Correct', 'Accuracy Rate', 'Total Points Earned'],
    ...(studentRows.length ? studentRows : [['No activity recorded', 0, 0, '0%', 0]]),
  ];

  // Sheet 3: Detailed Item Log
  const attemptRows = [
    [
      'Timestamp',
      'Learner Name',
      'Grade Level',
      'California CCSS-M Standard',
      'Standard Title',
      'Curriculum Cluster',
      'Question Prompt',
      'Student Answer',
      'Correct Answer',
      'Result',
      'Time (sec)',
      'Points',
    ],
    ...attempts.map((a) => [
      a.timestamp,
      a.studentName,
      `Grade ${a.grade}`,
      a.standard,
      a.standardTitle,
      a.cluster,
      a.prompt,
      a.studentAnswer,
      a.correctAnswer,
      a.isCorrect ? 'Correct' : 'Incorrect',
      a.responseTimeSec,
      a.points,
    ]),
  ];

  return [
    { name: 'Session Summary', rows: summaryRows },
    { name: 'Learner Performance', rows: rosterRows },
    { name: 'Detailed Item Log', rows: attemptRows },
  ];
}

export function exportClassroomSessionToXlsx(session) {
  if (!session) return;
  const sheets = buildClassroomWorksheets(session);
  const cleanGroup = (session.groupName || 'MathGroup').replace(/\s+/g, '_');
  const filename = `${cleanGroup}_SessionReport_${session.sessionId}.xlsx`;
  downloadWorkbook(filename, sheets);
}
