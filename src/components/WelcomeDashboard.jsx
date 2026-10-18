import React from 'react';
import { GRADES } from '../data/californiaCurriculum.js';
import { GAME_MODES } from './ModeSelector.jsx';

const GRADE_TILE_STYLES = {
  K: { gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', shadow: 'rgba(244, 63, 94, 0.35)', tag: 'Counting & Shapes' },
  '1': { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', shadow: 'rgba(245, 158, 11, 0.35)', tag: 'Add & Subtract to 20' },
  '2': { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.35)', tag: 'Place Value & Money' },
  '3': { gradient: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', shadow: 'rgba(37, 99, 235, 0.35)', tag: 'Multiply, Divide & Area' },
  '4': { gradient: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', shadow: 'rgba(124, 58, 237, 0.35)', tag: 'Fractions, Angles & Multi-Digit' },
  '5': { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c026d3 100%)', shadow: 'rgba(192, 38, 211, 0.35)', tag: 'Decimals, Volume & PEMDAS' },
};

export const PET_COMPANIONS = [
  { id: 'server-bot', name: 'Byte-Bot', icon: '🤖', desc: 'Funny Server Robo-Pet' },
  { id: 'golden-bear', name: 'Barnaby', icon: '🐻', desc: 'Dancing Golden Bear' },
  { id: 'sierra-dragon', name: 'Sparky', icon: '🐉', desc: 'Flying Sierra Dragon' },
];

export default function WelcomeDashboard({
  studentName,
  onStudentNameChange,
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

  return (
    <div className="welcome-dashboard">
      {/* Hero Banner */}
      <div className="welcome-hero">
        <div className="welcome-hero-badge">🌟 Official California K–5 Math Adventure</div>
        <h1 className="welcome-hero-title">Welcome to California Math Quest!</h1>
        <p className="welcome-hero-sub">
          Enter your name, pick your grade & companion pet, and start solving!
        </p>
      </div>

      <form className="welcome-setup-card" onSubmit={handleFormSubmit}>
        {/* Step 1: Student Name & Companion Pet */}
        <div className="welcome-row-split">
          <div className="welcome-step-block">
            <label htmlFor="kid-name-input" className="welcome-step-title">
              <span className="step-num-circle">1</span> What is your name?
            </label>
            <input
              id="kid-name-input"
              type="text"
              className="kid-name-input"
              placeholder="Type your name here (e.g., Leo, Maya)..."
              value={studentName}
              onChange={(e) => onStudentNameChange(e.target.value)}
              maxLength={24}
            />
          </div>

          <div className="welcome-step-block">
            <div className="welcome-step-title">
              <span className="step-num-circle">2</span> Choose Your Celebration Pet
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

        {/* Step 2: Big Beautiful Animated Grade Tiles */}
        <div className="welcome-step-block">
          <div className="welcome-step-title">
            <span className="step-num-circle">3</span> Choose Your Grade Level
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
                  {isSelected && <div className="tile-check-badge">✓ Selected</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Big Beautiful Animated Game Mode Tiles */}
        <div className="welcome-step-block">
          <div className="welcome-step-title">
            <span className="step-num-circle">4</span> Choose Your Game Mode
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

        {/* Giant Animated Launch Button */}
        <div className="welcome-launch-row">
          <button type="submit" className="welcome-start-btn">
            🚀 Start Playing {GRADES.find((g) => g.id === grade)?.label || ''} Math!
          </button>
        </div>
      </form>

      {/* Bottom Teacher & Curriculum Quick Bar */}
      <div className="welcome-teacher-bar">
        <button type="button" className="welcome-tool-link" onClick={onOpenCurriculum}>
          📘 82 Official CA Standards Map
        </button>
        <button type="button" className="welcome-tool-link" onClick={onOpenAchievements}>
          🏆 Mastery & Badges
        </button>
        <button type="button" className="welcome-tool-link" onClick={onOpenClassroom}>
          👥 Teacher Study Groups & Excel
        </button>
        <button type="button" className="welcome-tool-link" onClick={onOpenVault}>
          🧠 AI Knowledge Vault
        </button>
      </div>
    </div>
  );
}
