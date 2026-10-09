import React, { useState } from 'react';
import { PROGRAM_INFO } from '../data/californiaCurriculum.js';

export default function HelpGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📘</span>
            <h2>California Math Quest — Guide & Official Standards</h2>
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
              className={`tab-btn ${activeTab === 'facilitator' ? 'active' : ''}`}
              onClick={() => setActiveTab('facilitator')}
            >
              👥 Study Groups & Tutors
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              📜 California CCSS-M Standards
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'offline' ? 'active' : ''}`}
              onClick={() => setActiveTab('offline')}
            >
              📱 Privacy & Offline
            </button>
          </div>

          <div className="help-content-pane">
            {activeTab === 'student' && (
              <div className="help-section">
                <h3>Welcome to California Math Quest!</h3>
                <p>
                  California Math Quest is a free, interactive community platform designed to help California elementary
                  students master mathematics with confidence, visual understanding, and deep fluency.
                </p>

                <h4>Choose Your Scholar League:</h4>
                <div className="schools-grid">
                  {PROGRAM_INFO.leagues.map((l) => (
                    <div key={l.id} className="school-info-card">
                      <span className="school-card-badge">{l.badge}</span>
                      <div>
                        <strong>{l.name}</strong>
                        <div className="school-focus-text">{l.focus}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h4>Game Modes:</h4>
                <ul>
                  <li><strong>Grade Quest:</strong> Step-by-step progress through official California state standards for your grade.</li>
                  <li><strong>Speed Sprint:</strong> 60-second math sprint to build rapid calculation fluency.</li>
                  <li><strong>Manipulatives Lab:</strong> Interactive visual math with ten-frames, number lines, clocks, fraction bars, and coin trays.</li>
                  <li><strong>California Word Problems:</strong> Real-world scenarios set in California redwoods, state beaches, farm markets, and science centers.</li>
                  <li><strong>Smart Review:</strong> Spaced-repetition engine that brings back concepts right when you need practice.</li>
                  <li><strong>Mistake Review:</strong> Instant retry mode so you learn from your mistakes and achieve 100% mastery.</li>
                </ul>
              </div>
            )}

            {activeTab === 'facilitator' && (
              <div className="help-section">
                <h3>For Parents, Tutors & Study Groups</h3>
                <p>
                  Whether working with a single student at home, in an after-school tutoring circle, or in a community study group,
                  this platform gives you instant, privacy-respecting diagnostic tracking.
                </p>

                <h4>100% Privacy Guarantee:</h4>
                <p>
                  No student accounts, passwords, email addresses, or cloud servers are used. Everything runs locally inside the browser.
                </p>

                <h4>Multi-Sheet Excel (.xlsx) Reports:</h4>
                <p>
                  Download complete lesson summaries at any point with one tap:
                </p>
                <ol>
                  <li><strong>Session Summary:</strong> Overall questions answered, accuracy rate, and time.</li>
                  <li><strong>Learner Performance:</strong> Detailed stats broken down per learner.</li>
                  <li><strong>Detailed Item Log:</strong> Timestamped record of every problem, student response, correctness, and exact California CCSS-M standard code (e.g. <code>3.OA.C.7</code>).</li>
                </ol>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="help-section">
                <h3>Official California Common Core State Standards for Mathematics (CA CCSSM)</h3>
                <p>
                  All learning objectives and questions strictly reflect the California Department of Education (CDE) mathematics standards:
                </p>

                <h4>Grade Progression Overview:</h4>
                <ul>
                  <li><strong>Kindergarten (K):</strong> Counting & Cardinality (K.CC), Partners of 10, Teen numbers as 10 and ones (K.NBT), Comparing sizes (K.MD), 2D/3D shapes (K.G).</li>
                  <li><strong>1st Grade (1):</strong> Addition & Subtraction within 20 (1.OA), Unknown addends, Tens & ones place value to 120 (1.NBT), Telling time to hour/half-hour (1.MD), Halves & fourths (1.G).</li>
                  <li><strong>2nd Grade (2):</strong> Fluency within 20, 2-digit regrouping to 1,000 (2.NBT), Skip counting (5s, 10s, 100s), Money (coins & bills) (2.MD), Clock to 5 min.</li>
                  <li><strong>3rd Grade (3):</strong> Multiplication & Division fact fluency (0–12) (3.OA), Array models, Fractions on number lines (3.NF), Rounding to 10/100, Area & perimeter (3.MD).</li>
                  <li><strong>4th Grade (4):</strong> Multi-digit multiplication & division (4.NBT), Multi-step word problems (4.OA), Prime & composite numbers, Equivalent fractions & decimals (4.NF), Angle measurement with protractors (4.MD).</li>
                  <li><strong>5th Grade (5):</strong> Order of Operations with parentheses (PEMDAS) (5.OA), Decimals to thousandths (+, -, ×, ÷) (5.NBT), Adding unlike fractions (5.NF), Volume ($V = l \times w \times h$) (5.MD), Coordinate plane graphing $(x, y)$ (5.G).</li>
                </ul>
              </div>
            )}

            {activeTab === 'offline' && (
              <div className="help-section">
                <h3>Progressive Web App & Zero Dependencies</h3>
                <p>
                  Built as a standalone, offline-first Progressive Web App (PWA). Once loaded, no internet connection is required:
                </p>
                <ul>
                  <li>Fully compatible with school Chromebooks, iPads, tablets, and desktop browsers.</li>
                  <li>On-screen numeric keypad for touchscreens.</li>
                  <li>Native Web Audio API sound generator (no external audio files to fetch).</li>
                  <li>Pure JavaScript Open Packaging Convention spreadsheet engine for instant Excel export.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
