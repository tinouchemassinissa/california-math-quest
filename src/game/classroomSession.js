import { downloadWorkbook } from '../export/xlsxExport.js';
import { DISTRICT_INFO, STANDARDS } from '../data/cambrianCurriculum.js';

export function createClassSession({
  teacherName = 'Cambrian Teacher',
  className = 'Grade 3 Room A',
  schoolId = 'fammatre',
  now = Date.now(),
} = {}) {
  const school = DISTRICT_INFO.schools.find((s) => s.id === schoolId) || DISTRICT_INFO.schools[0];
  const dateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const sessionId = `CAMB-${dateStr}-${randomSuffix}`;

  return {
    sessionId,
    teacherName: teacherName.trim() || 'Teacher',
    className: className.trim() || 'Classroom',
    schoolId: school.id,
    schoolName: school.name,
    schoolMascot: school.mascot,
    activeStudent: 'Student 1',
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

  const attemptEntry = {
    id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(now).toISOString(),
    studentName: (studentName || session.activeStudent || 'Student').trim(),
    grade: String(grade || '3'),
    standard: String(standard || '3.OA.C.7'),
    standardTitle: STANDARDS[standard]?.title || 'Elementary Standard',
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

  // Aggregate by student
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
    ['CAMBRIAN SCHOOL DISTRICT — ELEMENTARY MATH SESSION REPORT'],
    ['Generated', new Date().toLocaleString()],
    ['District', DISTRICT_INFO.districtName],
    ['Location', DISTRICT_INFO.location],
    ['Curriculum', DISTRICT_INFO.framework],
    [''],
    ['Session Metric', 'Value'],
    ['Session ID', session.sessionId],
    ['School', session.schoolName],
    ['School Mascot', session.schoolMascot],
    ['Teacher', session.teacherName],
    ['Classroom', session.className],
    ['Session Started', session.startedAt],
    ['Total Students Active', Object.keys(studentMap).length],
    ['Total Problems Attempted', totalAttempts],
    ['Total Correct', totalCorrect],
    ['Overall Accuracy', `${overallAccuracy}%`],
  ];

  // Sheet 2: Student Performance
  const rosterRows = [
    ['Student Name', 'Questions Attempted', 'Questions Correct', 'Accuracy Rate', 'Total Points Earned'],
    ...(studentRows.length ? studentRows : [['No student activity recorded', 0, 0, '0%', 0]]),
  ];

  // Sheet 3: Detailed Question Attempts Log
  const attemptRows = [
    [
      'Timestamp',
      'Student Name',
      'Grade Level',
      'CCSS Standard',
      'Standard Domain/Topic',
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
    { name: 'Student Roster & Accuracy', rows: rosterRows },
    { name: 'Detailed Item Log', rows: attemptRows },
  ];
}

export function exportClassroomSessionToXlsx(session) {
  if (!session) return;
  const sheets = buildClassroomWorksheets(session);
  const cleanSchool = (session.schoolName || 'Cambrian').replace(/\s+/g, '_');
  const filename = `${cleanSchool}_MathSession_${session.sessionId}.xlsx`;
  downloadWorkbook(filename, sheets);
}
