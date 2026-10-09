import React, { useState } from 'react';
import { DISTRICT_INFO } from '../data/cambrianCurriculum.js';
import { exportClassroomSessionToXlsx } from '../game/classroomSession.js';

export default function ClassroomModal({
  isOpen,
  onClose,
  session,
  onStartSession,
  onUpdateActiveStudent,
}) {
  if (!isOpen) return null;

  const [teacher, setTeacher] = useState(session?.teacherName || '');
  const [className, setClassName] = useState(session?.className || '');
  const [schoolId, setSchoolId] = useState(session?.schoolId || 'fammatre');
  const [newStudentName, setNewStudentName] = useState(session?.activeStudent || '');

  const handleStart = (e) => {
    e.preventDefault();
    onStartSession({
      teacherName: teacher,
      className,
      schoolId,
    });
  };

  const handleSetStudent = (e) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onUpdateActiveStudent(newStudentName.trim());
    }
  };

  const attempts = session?.attempts || [];
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const accuracy = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">🏫</span>
            <h2>Cambrian Classroom Mode & Teacher Portal</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="classroom-banner">
            <p>
              Designed for Cambrian School District teachers. Tracks student math standard mastery
              locally with 100% student privacy (no cloud transmission), and exports structured
              Excel reports for gradebooks and lesson planning.
            </p>
          </div>

          {session ? (
            <div className="session-dashboard">
              <div className="session-stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Session ID</div>
                  <div className="stat-value code-font">{session.sessionId}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">School & Class</div>
                  <div className="stat-value">{session.schoolName}</div>
                  <div className="stat-sub">{session.className} ({session.teacherName})</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Problems Attempted</div>
                  <div className="stat-value">{attempts.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Class Accuracy</div>
                  <div className="stat-value">{accuracy}%</div>
                </div>
              </div>

              {/* Student Switcher */}
              <div className="student-switch-bar">
                <form onSubmit={handleSetStudent} className="student-form">
                  <label htmlFor="student-input">Current Active Student:</label>
                  <input
                    id="student-input"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Enter student name..."
                    className="text-input"
                  />
                  <button type="submit" className="btn btn-secondary">
                    Switch Student
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="classroom-export-row">
                <button
                  type="button"
                  className="btn btn-primary export-btn"
                  onClick={() => exportClassroomSessionToXlsx(session)}
                >
                  📥 Export Session to Excel (.xlsx)
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onStartSession({ teacherName: teacher, className, schoolId })}
                >
                  🔄 Reset / Start New Session
                </button>
              </div>

              {/* Recent Attempts Table Preview */}
              <div className="attempts-preview-section">
                <h3>Live Session Attempts Log ({attempts.length})</h3>
                {attempts.length === 0 ? (
                  <p className="empty-state">No questions answered yet during this lesson session.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Standard</th>
                          <th>Prompt</th>
                          <th>Answer</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.slice(-8).reverse().map((att) => (
                          <tr key={att.id}>
                            <td><strong>{att.studentName}</strong></td>
                            <td><span className="code-pill">{att.standard}</span></td>
                            <td className="truncate-prompt">{att.prompt}</td>
                            <td>{att.studentAnswer}</td>
                            <td>
                              <span className={`status-pill ${att.isCorrect ? 'correct' : 'incorrect'}`}>
                                {att.isCorrect ? '✓ Correct' : '✕ Missed'}
                              </span>
                            </td>
                            <td>{att.responseTimeSec}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleStart} className="session-start-form">
              <h3>Start a New Classroom Lesson</h3>
              <div className="form-group">
                <label>Cambrian Elementary School:</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="styled-select"
                >
                  {DISTRICT_INFO.schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.badge} {s.name} ({s.mascot})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Teacher Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Rodriguez"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="text-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Classroom / Group Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Room 14 - Grade 3 Math"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="text-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Launch Lesson Session
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
