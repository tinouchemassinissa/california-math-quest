import React, { useState } from 'react';
import { GRADES } from '../data/californiaCurriculum.js';
import { GAME_MODES } from './ModeSelector.jsx';
import { DIFFICULTY_PRESETS } from '../game/learningEngine.js';

export default function Header({
  studentName,
  grade,
  mode,
  onGoHome,
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

  const gradeInfo = GRADES.find((g) => g.id === grade) || GRADES[3];
  const modeInfo = GAME_MODES.find((m) => m.id === mode) || GAME_MODES[0];

  return (
    <header className="app-header slim-play-header">
      <div className="slim-header-row">
        {/* Left: Home / Welcome Dashboard Button + Active Player & Grade Pill */}
        <div className="slim-left-group">
          <button
            type="button"
            className="home-dashboard-btn"
            onClick={onGoHome}
            title="Return to Welcome Dashboard to change Name, Grade, Pet, or Mode"
          >
            🏠 <span>Change Grade / Mode</span>
          </button>

          <div className="player-active-chip">
            <span className="player-chip-name">
              👋 {studentName?.trim() || 'Explorer'}
            </span>
            <span className="player-chip-sep">•</span>
            <span className="player-chip-grade">
              {gradeInfo.icon} {gradeInfo.label}
            </span>
            <span className="player-chip-sep">•</span>
            <span className="player-chip-mode">
              {modeInfo.icon} {modeInfo.shortTitle || modeInfo.title}
            </span>
          </div>
        </div>

        {/* Right: Clean Live HUD (Hearts, Streak, Stars) + Minimal Icons */}
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
              🏆
            </button>

            <button
              type="button"
              className={`kid-teacher-toggle ${teacherMenuOpen ? 'active' : ''}`}
              onClick={() => setTeacherMenuOpen((v) => !v)}
              title="Teacher & Standards Tools"
            >
              👩‍🏫
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
              📘 CA Standards Practice Map
            </button>

            <button
              type="button"
              className="drawer-tool-btn"
              onClick={() => {
                setTeacherMenuOpen(false);
                onOpenClassroom();
              }}
            >
              👥 {activeClassSession ? `${activeClassSession.groupName} (${activeClassSession.activeStudent})` : 'Study Groups & Excel'}
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
