import React, { useState } from 'react';
import { PROGRAM_INFO } from '../data/californiaCurriculum.js';
import { exportClassroomSessionToXlsx } from '../game/classroomSession.js';

export default function ClassroomModal({
  isOpen,
  onClose,
  session,
  onStartSession,
  onUpdateActiveStudent,
}) {
  if (!isOpen) return null;

  const [leader, setLeader] = useState(session?.leaderName || '');
  const [groupName, setGroupName] = useState(session?.groupName || '');
  const [leagueId, setLeagueId] = useState(session?.leagueId || 'golden-bears');
  const [newStudentName, setNewStudentName] = useState(session?.activeStudent || '');

  const handleStart = (e) => {
    e.preventDefault();
    onStartSession({
      leaderName: leader,
      groupName,
      leagueId,
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
            <span className="modal-icon">👥</span>
            <h2>California Community Study Groups & Tutor Portal</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="classroom-banner">
            <p>
              Created for California student study circles, after-school tutoring programs, homeschools,
              and classroom practice. Tracks standard mastery locally with <strong>100% student privacy</strong> (no
              cloud transmission or logins), and exports structured Excel workbooks for student records.
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
                  <div className="stat-label">Group & League</div>
                  <div className="stat-value">{session.groupName}</div>
                  <div className="stat-sub">{session.leagueBadge} {session.leagueName} ({session.leaderName})</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Problems Attempted</div>
                  <div className="stat-value">{attempts.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Group Accuracy</div>
                  <div className="stat-value">{accuracy}%</div>
                </div>
              </div>

              {/* Student Switcher */}
              <div className="student-switch-bar">
                <form onSubmit={handleSetStudent} className="student-form">
                  <label htmlFor="student-input">Current Active Learner:</label>
                  <input
                    id="student-input"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Enter student name..."
                    className="text-input"
                  />
                  <button type="submit" className="btn btn-secondary">
                    Switch Learner
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
                  onClick={() => onStartSession({ leaderName: leader, groupName, leagueId })}
                >
                  🔄 Reset / Start New Session
                </button>
              </div>

              {/* Recent Attempts Table Preview */}
              <div className="attempts-preview-section">
                <h3>Live Session Attempts Log ({attempts.length})</h3>
                {attempts.length === 0 ? (
                  <p className="empty-state">No questions answered yet during this study session.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Learner</th>
                          <th>CA Standard</th>
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
              <h3>Start a New Community Study Session</h3>
              <div className="form-group">
                <label>California Scholar League:</label>
                <select
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  className="styled-select"
                >
                  {PROGRAM_INFO.leagues.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.badge} {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Facilitator / Parent / Tutor Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Coach Sarah"
                  value={leader}
                  onChange={(e) => setLeader(e.target.value)}
                  className="text-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Study Group / Club Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 4 Math Olympians"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="text-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Launch Study Session
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
