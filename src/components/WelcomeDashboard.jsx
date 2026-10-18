import React from 'react';
import { GRADES, PROGRAM_INFO } from '../data/californiaCurriculum.js';
import { GAME_MODES } from './ModeSelector.jsx';

const GRADE_TILE_STYLES = {
  K: { gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', shadow: 'rgba(244, 63, 94, 0.35)', tag: 'Counting & Shapes' },
  '1': { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', shadow: 'rgba(245, 158, 11, 0.35)', tag: 'Add & Subtract to 20' },
  '2': { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.35)', tag: 'Place Value & Money' },
  '3': { gradient: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', shadow: 'rgba(37, 99, 235, 0.35)', tag: 'Multiply, Divide & Area' },
  '4': { gradient: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', shadow: 'rgba(124, 58, 237, 0.35)', tag: 'Fractions & Angles' },
  '5': { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c026d3 100%)', shadow: 'rgba(192, 38, 211, 0.35)', tag: 'Decimals & Volume' },
};

export const PET_COMPANIONS = [
  { id: 'server-bot', name: 'Byte-Bot', icon: '🤖', desc: 'Server Robo-Pet' },
  { id: 'golden-bear', name: 'Barnaby', icon: '🐻', desc: 'CA Golden Bear' },
  { id: 'sierra-dragon', name: 'Sparky', icon: '🐉', desc: 'Sierra Dragon' },
];

export default function WelcomeDashboard({
  studentName,
  onStudentNameChange,
  leagueId = 'bagby-barracudas',
  onSelectLeague,
  grade,
  onSelectGrade,
  mode,
  onSelectMode,
  petId,
  onSelectPet,
  mistakeCount = 0,
  onStartGame,
  onOpenCurriculum,
  onOpenAchievements,
  onOpenClassroom,
  onOpenVault,
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onStartGame();
  };

  const activeGradeLabel = GRADES.find((g) => g.id === grade)?.label || 'Grade 3';

  return (
    <div className="welcome-dashboard">
      {/* Compact Top Bar: Official California & Cambrian District Badge + Educator Quick Tools */}
      <div className="welcome-top-bar">
        <div className="welcome-brand-group">
          <div className="welcome-hero-badge">
            🌟 Official California CCSS-M • Cambrian School District (Eureka Math K–5)
          </div>
          <h1 className="welcome-hero-title">California Elementary Math Quest</h1>
        </div>

        <div className="welcome-teacher-bar">
          <button type="button" className="welcome-tool-link" onClick={onOpenCurriculum}>
            📘 82 CA Standards
          </button>
          <button type="button" className="welcome-tool-link" onClick={onOpenAchievements}>
            🏆 Badges
          </button>
          <button type="button" className="welcome-tool-link" onClick={onOpenClassroom}>
            👥 Study Groups
          </button>
          <button type="button" className="welcome-tool-link" onClick={onOpenVault}>
            🧠 AI Vault
          </button>
        </div>
      </div>

      {/* Zero-Scroll 2-Column Bento Setup Card */}
      <form className="welcome-bento-grid" onSubmit={handleFormSubmit}>
        {/* Left Bento Panel: Name + School + Pet Companion + Grade Tiles */}
        <div className="welcome-bento-panel">
          <div className="welcome-profile-split">
            <div className="welcome-step-block">
              <label htmlFor="kid-name-input" className="welcome-step-title">
                <span className="step-num-circle">1</span> Scholar Name & School
              </label>
              <div className="kid-name-school-stack">
                <input
                  id="kid-name-input"
                  type="text"
                  className="kid-name-input"
                  placeholder="Type your name (e.g., Leo, Maya)..."
                  value={studentName}
                  onChange={(e) => onStudentNameChange(e.target.value)}
                  maxLength={24}
                />
                {onSelectLeague && (
                  <select
                    aria-label="Choose your Cambrian School or California Team"
                    className="kid-school-select"
                    value={leagueId}
                    onChange={(e) => onSelectLeague(e.target.value)}
                  >
                    {PROGRAM_INFO.leagues.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.badge} {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="welcome-step-block">
              <div className="welcome-step-title">
                <span className="step-num-circle">2</span> Celebration Pet
              </div>
              <div className="welcome-pet-tiles">
                {PET_COMPANIONS.map((pet) => {
                  const isSelected = petId === pet.id;
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      className={`welcome-pet-tile ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectPet(pet.id)}
                    >
                      <span className="pet-tile-emoji">{pet.icon}</span>
                      <span className="pet-tile-name">{pet.name}</span>
                      <span className="pet-tile-desc">{pet.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: 6 Big Animated Grade Tiles (K - 5) */}
          <div className="welcome-step-block">
            <div className="welcome-step-title">
              <span className="step-num-circle">3</span> Pick Your Grade Level (K–5)
            </div>
            <div className="welcome-grade-grid">
              {GRADES.map((g) => {
                const isSelected = grade === g.id;
                const styleInfo = GRADE_TILE_STYLES[g.id] || GRADE_TILE_STYLES['3'];
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`welcome-grade-tile ${isSelected ? 'selected' : ''}`}
                    style={{
                      '--tile-grad': styleInfo.gradient,
                      '--tile-shadow': styleInfo.shadow,
                    }}
                    onClick={() => onSelectGrade(g.id)}
                  >
                    <div className="grade-tile-icon-wrap">{g.icon}</div>
                    <div className="grade-tile-main">{g.label}</div>
                    <div className="grade-tile-tag">{styleInfo.tag}</div>
                    {isSelected && <div className="tile-check-badge">✓</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Bento Panel: 6 Game Mode Tiles + Giant Start Button */}
        <div className="welcome-bento-panel welcome-right-panel">
          <div className="welcome-step-block" style={{ flex: 1 }}>
            <div className="welcome-step-title">
              <span className="step-num-circle">4</span> Choose Your Math Adventure Mode
            </div>
            <div className="welcome-mode-grid">
              {GAME_MODES.map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`welcome-mode-tile ${isSelected ? 'selected' : ''}`}
                    style={{ '--mode-color': m.color }}
                    onClick={() => onSelectMode(m.id)}
                  >
                    <span className="mode-tile-icon">{m.icon}</span>
                    <div className="mode-tile-text">
                      <div className="mode-tile-title">
                        {m.title}
                        {m.id === 'mistake-review' && mistakeCount > 0 && (
                          <span className="mode-tile-pill">{mistakeCount}</span>
                        )}
                      </div>
                      <div className="mode-tile-sub">{m.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Giant Animated Launch Button + 100% Verified Kid-Safety Guarantee */}
          <div className="welcome-launch-box">
            <button type="submit" className="welcome-start-btn">
              🚀 Start {activeGradeLabel} Math Quest!
            </button>
            <div className="welcome-safety-guarantee">
              <span>🛡️ 100% Kid-Safe & Ad-Free</span>
              <span>•</span>
              <span>✓ Formally Verified CA & Cambrian District Math</span>
              <span>•</span>
              <span>🔊 Read-Aloud Ready</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
