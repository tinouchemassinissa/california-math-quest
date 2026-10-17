import React from 'react';

export const GAME_MODES = [
  {
    id: 'grade-quest',
    title: 'Grade Quest',
    shortTitle: 'Quest',
    subtitle: 'California CCSS-M Standards Progression',
    icon: '🗺️',
    badge: 'Core Program',
    color: '#6366f1',
  },
  {
    id: 'speed-sprint',
    title: 'Speed Sprint',
    shortTitle: '60s Sprint',
    subtitle: '60s California Math Fluency Dash',
    icon: '⚡',
    badge: 'Timed Challenge',
    color: '#f43f5e',
  },
  {
    id: 'manipulatives',
    title: 'Manipulatives Lab',
    shortTitle: 'Hands-On Lab',
    subtitle: 'Ten-Frames, Number Lines, Clocks & Geometry',
    icon: '🧩',
    badge: 'Hands-On Visuals',
    color: '#06b6d4',
  },
  {
    id: 'word-problems',
    title: 'California Word Problems',
    shortTitle: 'Word Stories',
    subtitle: 'Golden State Real-World Math Scenarios',
    icon: '📖',
    badge: 'Applied Math',
    color: '#f59e0b',
  },
  {
    id: 'smart-review',
    title: 'Smart Review',
    shortTitle: 'Smart Review',
    subtitle: 'Spaced Repetition for Maximum Retention',
    icon: '🧠',
    badge: 'Adaptive Practice',
    color: '#10b981',
  },
  {
    id: 'mistake-review',
    title: 'Mistake Review',
    shortTitle: 'Fix Mistakes',
    subtitle: 'Turn Previous Slips into Mastery',
    icon: '🎯',
    badge: 'Growth Mindset',
    color: '#a855f7',
  },
];

export default function ModeSelector({ currentMode, onSelectMode, mistakeCount = 0 }) {
  return (
    <nav className="kid-mode-bar" aria-label="Game Modes">
      {GAME_MODES.map((mode) => {
        const isActive = currentMode === mode.id;
        const isMistake = mode.id === 'mistake-review';
        return (
          <button
            key={mode.id}
            type="button"
            className={`kid-mode-pill ${isActive ? 'active' : ''}`}
            style={{
              '--mode-accent': mode.color,
            }}
            onClick={() => onSelectMode(mode.id)}
            title={`${mode.title}: ${mode.subtitle}`}
          >
            <span className="kid-mode-icon">{mode.icon}</span>
            <span className="kid-mode-label">{mode.shortTitle}</span>
            {isMistake && mistakeCount > 0 && (
              <span className="kid-mistake-badge">{mistakeCount}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
