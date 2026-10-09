import React from 'react';

export const GAME_MODES = [
  {
    id: 'grade-quest',
    title: 'Grade Quest',
    subtitle: 'California CCSS-M Standards Progression',
    icon: '🗺️',
    badge: 'Core Program',
    color: '#4f46e5',
  },
  {
    id: 'speed-sprint',
    title: 'Speed Sprint',
    subtitle: '60s Cambrian Park Math Dash',
    icon: '⚡',
    badge: 'Timed Challenge',
    color: '#e11d48',
  },
  {
    id: 'manipulatives',
    title: 'Manipulatives Lab',
    subtitle: 'Ten-Frames, Number Lines, Clocks & Fractions',
    icon: '🧩',
    badge: 'Hands-On Visuals',
    color: '#0891b2',
  },
  {
    id: 'word-problems',
    title: 'California Word Problems',
    subtitle: 'Silicon Valley & Cambrian Park Real-World Scenarios',
    icon: '📖',
    badge: 'Applied Math',
    color: '#d97706',
  },
  {
    id: 'smart-review',
    title: 'Smart Review',
    subtitle: 'Spaced Repetition for Maximum Retention',
    icon: '🧠',
    badge: 'Adaptive Practice',
    color: '#16a34a',
  },
  {
    id: 'mistake-review',
    title: 'Mistake Review',
    subtitle: 'Turn Previous Slips into Mastery',
    icon: '🎯',
    badge: 'Growth Mindset',
    color: '#9333ea',
  },
];

export default function ModeSelector({ currentMode, onSelectMode, mistakeCount = 0 }) {
  return (
    <div className="mode-selector-strip">
      <div className="mode-cards-grid">
        {GAME_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          const isMistake = mode.id === 'mistake-review';
          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <div className="mode-card-header">
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-badge">{mode.badge}</span>
              </div>
              <div className="mode-title">{mode.title}</div>
              <div className="mode-subtitle">{mode.subtitle}</div>
              {isMistake && mistakeCount > 0 && (
                <div className="mode-counter-pill">{mistakeCount} to review</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
