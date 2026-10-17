import React, { useState } from 'react';
import { PROGRAM_INFO, GRADES } from '../data/californiaCurriculum.js';
import { DIFFICULTY_PRESETS } from '../game/learningEngine.js';

export default function Header({
  grade,
  onGradeChange,
  leagueId,
  onLeagueChange,
  difficulty,
  onDifficultyChange,
  score,
  streak,
  lives,
  maxLives,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  theme,
  onToggleTheme,
  timedPractice,
  onToggleTimedPractice,
  onOpenClassroom,
  onOpenCurriculum,
  onOpenHelp,
  onOpenVault,
  onOpenAchievements,
  activeClassSession,
}) {
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false);

  const currentLeague =
    PROGRAM_INFO.leagues.find((l) => l.id === leagueId) || PROGRAM_INFO.leagues[0];

  const cycleLeague = () => {
    const idx = PROGRAM_INFO.leagues.findIndex((l) => l.id === leagueId);
    const next = PROGRAM_INFO.leagues[(idx + 1) % PROGRAM_INFO.leagues.length];
    onLeagueChange(next.id);
  };

  return (
    <header className="app-header kid-header">
      <div className="kid-header-main">
        {/* Left: Bouncy Mascot + Title */}
        <div className="brand-group">
          <button
            type="button"
            className="school-badge-icon mascot-bounce"
            style={{ borderColor: currentLeague.color }}
            onClick={cycleLeague}
            title={`Click to change mascot! Current: ${currentLeague.name}`}
          >
            {currentLeague.badge}
          </button>
          <div className="brand-titles">
            <h1 className="district-title">California Math Quest</h1>
            <div className="district-sub">
              <span className="mascot-team-pill" onClick={cycleLeague} title="Tap to switch mascot">
                {currentLeague.name} 🐾
              </span>
            </div>
          </div>
        </div>

        {/* Center: Big Kid-Friendly Grade Bubbles (K - 5) */}
        <div className="kid-grade-picker" role="group" aria-label="Choose your grade">
          <span className="grade-picker-label">Grade:</span>
          {GRADES.map((g) => {
            const isSelected = grade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                className={`grade-bubble-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onGradeChange(g.id)}
                title={g.subtitle || g.label}
              >
                <span className="grade-bubble-icon">{g.icon}</span>
                <span className="grade-bubble-text">
                  {g.id === 'K' ? 'K' : `${g.id}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Playful Animated HUD + Quick Actions */}
        <div className="kid-hud-and-actions">
          <div className="game-hud">
            {lives !== null && (
              <div className="lives-display" title={`${lives} hearts remaining`}>
                {Array.from({ length: maxLives || 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`heart-icon ${i < lives ? 'active' : 'spent'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            )}

            <div className={`hud-pill streak-pill ${streak >= 3 ? 'on-fire' : ''}`} title="Current Streak">
              <span className="hud-pill-emoji">{streak >= 3 ? '🔥' : '⚡'}</span>
              <span className="hud-pill-num">{streak}</span>
            </div>

            <div className="hud-pill score-pill" title="Total Star Score">
              <span className="hud-pill-emoji">⭐</span>
              <span className="hud-pill-num">{score}</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="kid-trophy-btn"
              onClick={onOpenAchievements}
              title="My Badges & Trophies"
            >
              🏆 <span>Badges</span>
            </button>

            <button
              type="button"
              className={`kid-teacher-toggle ${teacherMenuOpen ? 'active' : ''}`}
              onClick={() => setTeacherMenuOpen((v) => !v)}
              title="Open Standards Map, Teacher Tools & Difficulty Options"
            >
              👩‍🏫 <span>Tools</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Sound Effects On' : 'Sound Effects Muted'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleMusic}
              title={musicEnabled ? 'Background Music On' : 'Background Music Off'}
            >
              {musicEnabled ? '🎵' : '🎶'}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Sunny Light' : 'Night Space'} Theme`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              className="icon-btn help-btn"
              onClick={onOpenHelp}
              title="How to Play & Guide"
            >
              ❓
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Teacher / Parent & Curriculum Drawer */}
      {teacherMenuOpen && (
        <div className="teacher-drawer">
          <div className="teacher-drawer-left">
            <div className="select-wrapper">
              <label htmlFor="diff-select">Difficulty:</label>
              <select
                id="diff-select"
                value={difficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="styled-select"
              >
                {Object.values(DIFFICULTY_PRESETS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} ({d.multiplier}x)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={`drawer-tool-btn ${timedPractice ? 'active-timer' : ''}`}
              onClick={onToggleTimedPractice}
              title="Toggle question countdown timer for normal modes"
            >
              {timedPractice ? '⏱️ Timer: ON' : '🧘 Relaxed Mode (No Timer)'}
            </button>
          </div>

          <div className="teacher-drawer-links">
            <button
              type="button"
              className="drawer-tool-btn primary-tool"
              onClick={() => {
                setTeacherMenuOpen(false);
                onOpenCurriculum();
              }}
            >
              📘 CA Standards Map (82 Standards)
            </button>

            <button
              type="button"
              className="drawer-tool-btn"
              onClick={() => {
                setTeacherMenuOpen(false);
                onOpenClassroom();
              }}
            >
              👥 {activeClassSession ? `${activeClassSession.groupName} (${activeClassSession.activeStudent})` : 'Study Groups & Excel Export'}
            </button>

            <button
              type="button"
              className="drawer-tool-btn"
              onClick={() => {
                setTeacherMenuOpen(false);
                onOpenVault();
              }}
            >
              🧠 AI Knowledge Vault
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
