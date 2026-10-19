import React from 'react';
import { getProgressSummary, computeAchievements } from '../game/learningEngine.js';

export default function AchievementsModal({
  isOpen,
  onClose,
  learnerProfile,
  currentGrade,
  modeRecords = {},
}) {
  if (!isOpen || !learnerProfile) return null;

  const overallSummary = getProgressSummary(learnerProfile);
  const achievements = computeAchievements(learnerProfile, modeRecords).map(a=>({...a,title:a.id==='golden-scholar'?'Idea Explorer':a.title,desc:a.id==='first-step'?'Try your first maths question.':a.id==='comeback-kid'?'Keep practising after a tricky start.':a.id==='golden-scholar'?'Build confidence across several maths ideas.':a.desc}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" role="dialog" aria-modal="true" aria-label="My badges" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🏆 My badges</h2>
            <p className="modal-subtitle">
              Little steps worth celebrating.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>🌱 You have tried {overallSummary.totalAttempts} arcade questions. Keep exploring at your own pace.</p>
          {/* Achievements Grid */}
          <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>
            🏅 My discoveries ({achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: ach.unlocked ? '2px solid #10b981' : '1px dashed rgba(150,150,150,0.35)',
                  background: ach.unlocked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.02)',
                  opacity: ach.unlocked ? 1 : 0.65,
                }}
              >
                <div style={{ fontSize: '28px' }}>{ach.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>
                    {ach.title} {ach.unlocked && '✓'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.85 }}>{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
