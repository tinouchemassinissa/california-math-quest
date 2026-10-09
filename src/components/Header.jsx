import React from 'react';
import { DISTRICT_INFO, GRADES } from '../data/cambrianCurriculum.js';
import { DIFFICULTY_PRESETS } from '../game/learningEngine.js';

export default function Header({
  grade,
  onGradeChange,
  schoolId,
  onSchoolChange,
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
  onOpenClassroom,
  onOpenCurriculum,
  onOpenHelp,
  activeClassSession,
}) {
  const currentSchool = DISTRICT_INFO.schools.find((s) => s.id === schoolId) || DISTRICT_INFO.schools[0];
  const diffInfo = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.intermediate;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="school-badge-icon" style={{ borderColor: currentSchool.color }}>
            {currentSchool.badge}
          </div>
          <div className="brand-titles">
            <h1 className="district-title">Cambrian Math Quest</h1>
            <div className="district-sub">
              <span>{currentSchool.name}</span> • <span>{DISTRICT_INFO.location}</span>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="header-actions">
          {activeClassSession && (
            <button
              type="button"
              className="badge-pill class-pill"
              onClick={onOpenClassroom}
              title="Classroom Session Active"
            >
              🏫 {activeClassSession.className} ({activeClassSession.activeStudent})
            </button>
          )}

          <button
            type="button"
            className="icon-btn"
            onClick={onToggleMusic}
            title={musicEnabled ? 'Focus Ambient Music (Playing)' : 'Start Focus Ambient Music'}
          >
            {musicEnabled ? '🎵' : '🔇'}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="icon-btn help-btn"
            onClick={onOpenHelp}
            title="Help & Curriculum Guide"
          >
            ❓
          </button>
        </div>
      </div>

      <div className="header-subbar">
        {/* Selectors */}
        <div className="selectors-group">
          <div className="select-wrapper">
            <label htmlFor="school-select">School:</label>
            <select
              id="school-select"
              value={schoolId}
              onChange={(e) => onSchoolChange(e.target.value)}
              className="styled-select"
            >
              {DISTRICT_INFO.schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.badge} {s.name} ({s.mascot})
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <label htmlFor="grade-select">Grade:</label>
            <select
              id="grade-select"
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="styled-select"
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.label}
                </option>
              ))}
            </select>
          </div>

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
            className="text-link-btn"
            onClick={onOpenCurriculum}
          >
            Standards Map
          </button>

          <button
            type="button"
            className="text-link-btn teacher-link"
            onClick={onOpenClassroom}
          >
            Teacher Portal
          </button>
        </div>

        {/* Live Gameplay HUD */}
        <div className="game-hud">
          {lives !== null && (
            <div className="lives-display" title={`${lives} lives remaining`}>
              {Array.from({ length: maxLives || 3 }).map((_, i) => (
                <span key={i} className={`heart-icon ${i < lives ? 'active' : 'spent'}`}>
                  ❤️
                </span>
              ))}
            </div>
          )}

          <div className="hud-metric">
            <span className="hud-label">Streak</span>
            <span className={`hud-val streak-val ${streak >= 3 ? 'on-fire' : ''}`}>
              {streak >= 3 && '🔥 '}
              {streak}
            </span>
          </div>

          <div className="hud-metric">
            <span className="hud-label">Score</span>
            <span className="hud-val score-val">{score}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
