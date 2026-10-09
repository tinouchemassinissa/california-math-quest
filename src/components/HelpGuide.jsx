import React, { useState } from 'react';
import { DISTRICT_INFO } from '../data/cambrianCurriculum.js';

export default function HelpGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📘</span>
            <h2>Cambrian Math Quest — Guide & Documentation</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="help-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveTab('student')}
            >
              🎒 Student Guide
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
              onClick={() => setActiveTab('teacher')}
            >
              👩‍🏫 Teacher & Classroom
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              🏫 Cambrian District Program
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'offline' ? 'active' : ''}`}
              onClick={() => setActiveTab('offline')}
            >
              📱 Offline & Devices
            </button>
          </div>

          <div className="help-content-pane">
            {activeTab === 'student' && (
              <div className="help-section">
                <h3>Welcome to Cambrian Math Quest!</h3>
                <p>
                  Cambrian Math Quest makes math fun, interactive, and rewarding! Choose your elementary
                  school mascot, pick your grade (Kindergarten through 5th Grade), and embark on standard quests.
                </p>

                <h4>Game Modes:</h4>
                <ul>
                  <li>
                    <strong>Grade Quest:</strong> Core California standard roadmap with progressive difficulty.
                  </li>
                  <li>
                    <strong>Speed Sprint:</strong> 60-second Cambrian Park Math Dash! Score combos and speed bonuses.
                  </li>
                  <li>
                    <strong>Manipulatives Lab:</strong> Hands-on visual models like ten-frames, number lines, clocks, fraction bars, and coins.
                  </li>
                  <li>
                    <strong>California Word Problems:</strong> Real-world story problems set in Cambrian Park, San Jose, and Silicon Valley.
                  </li>
                  <li>
                    <strong>Smart Review:</strong> Spaced repetition system that reviews standards right when your brain needs practice.
                  </li>
                  <li>
                    <strong>Mistake Review:</strong> Instant retry mode to turn mistakes into masteries.
                  </li>
                </ul>

                <h4>Hearts, Streaks & Multipliers:</h4>
                <p>
                  Keep answering correctly to build up your streak multiplier (up to 5x!). Watch your lives (hearts) —
                  if you run out of lives, you can review your mistakes and try again.
                </p>
              </div>
            )}

            {activeTab === 'teacher' && (
              <div className="help-section">
                <h3>Teacher & Classroom Workflow</h3>
                <p>
                  Cambrian Math Quest includes an in-browser classroom management system designed for Cambrian
                  elementary classrooms (Fammatre, Farnham, Sartorette, Bagby, Steindorf).
                </p>

                <h4>Privacy First:</h4>
                <p>
                  No student account creation or third-party cloud data transmission is required. All session
                  analytics are kept 100% locally on the device.
                </p>

                <h4>Instant Excel (.xlsx) Export:</h4>
                <p>
                  At the end of your lesson, tap <strong>Export Session to Excel</strong> in the Teacher Portal.
                  The app generates a complete 3-sheet Excel workbook without external network requests:
                </p>
                <ol>
                  <li><strong>Class Session Summary:</strong> Metrics, total problems, overall accuracy, school and teacher info.</li>
                  <li><strong>Student Roster & Accuracy:</strong> Performance grouped by student with accuracy % and points.</li>
                  <li><strong>Detailed Item Log:</strong> Individual question attempts with standard code (e.g. <code>CCSS.MATH 3.OA.C.7</code>), timestamp, student answer, and speed.</li>
                </ol>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="help-section">
                <h3>Cambrian School District & California CCSS-M</h3>
                <p>
                  The mathematics standards in this program are directly aligned with the California
                  Common Core State Standards for Mathematics (CCSS-M) and the California Mathematics Framework.
                </p>

                <h4>Participating Cambrian Schools:</h4>
                <div className="schools-grid">
                  {DISTRICT_INFO.schools.map((s) => (
                    <div key={s.id} className="school-info-card">
                      <span className="school-card-badge">{s.badge}</span>
                      <div>
                        <strong>{s.name}</strong> ({s.mascot})
                        <div className="school-focus-text">{s.focus}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h4>Grade Level Coverage:</h4>
                <ul>
                  <li><strong>Kindergarten (K):</strong> Counting & Cardinality (K.CC), Ten-frames, Sums to 10, Shapes.</li>
                  <li><strong>1st Grade (1):</strong> Addition & Subtraction to 20, Tens and Ones, Analog clocks to half hour.</li>
                  <li><strong>2nd Grade (2):</strong> 2-digit regrouping, Skip counting (5s, 10s, 100s), Money (coins & bills), Clock to 5 min.</li>
                  <li><strong>3rd Grade (3):</strong> Multiplication & Division fluency (0-12), Fractions on number line, Area & Perimeter.</li>
                  <li><strong>4th Grade (4):</strong> Multi-digit multiplication, Multi-step word problems, Equivalent fractions, Angles & Protractors.</li>
                  <li><strong>5th Grade (5):</strong> PEMDAS order of operations, Decimals (+ - × ÷), Unlike fraction addition, Volume, Coordinate Plane (x, y).</li>
                </ul>
              </div>
            )}

            {activeTab === 'offline' && (
              <div className="help-section">
                <h3>Offline-First & Universal Device Compatibility</h3>
                <p>
                  Cambrian Math Quest is built as a Progressive Web Application (PWA). Once loaded, all game logic,
                  audio synthesizers, question generators, and Excel export engines operate fully offline without an internet connection.
                </p>
                <p>
                  <strong>Tested and optimized for:</strong>
                </p>
                <ul>
                  <li>Chromebooks (common in Cambrian elementary classrooms)</li>
                  <li>Apple iPads and Android tablets (touch-friendly on-screen keypad included)</li>
                  <li>Windows, macOS, and Linux desktop browsers</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
