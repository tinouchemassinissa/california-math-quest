import React from 'react';
import { GRADES, DOMAINS, STANDARDS } from '../data/californiaCurriculum.js';
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
  const gradeSummary = getProgressSummary(learnerProfile, currentGrade);
  const achievements = computeAchievements(learnerProfile, modeRecords);
  const gradeObj = GRADES.find((g) => g.id === currentGrade) || GRADES[3];

  const domainBreakdown = Object.values(DOMAINS)
    .filter((d) => d.grades.includes(currentGrade))
    .map((dom) => {
      const codes = Object.keys(STANDARDS).filter(
        (c) => STANDARDS[c].grade === currentGrade && STANDARDS[c].domain === dom.code
      );
      let sumMastery = 0;
      let mastered = 0;
      codes.forEach((c) => {
        const st = learnerProfile.standards?.[c];
        if (st) {
          sumMastery += st.mastery || 0;
          if (st.mastery >= 0.8) mastered += 1;
        }
      });
      const pct = codes.length ? Math.round((sumMastery / codes.length) * 100) : 0;
      return {
        ...dom,
        totalCount: codes.length,
        masteredCount: mastered,
        masteryPct: pct,
      };
    });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🏆 California Scholar Progress & Badges</h2>
            <p className="modal-subtitle">
              CA CCSS-M Standards Mastery, Domain Analytics & Unlocked Achievements
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Top KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4f46e5' }}>
                {overallSummary.totalCorrect} / {overallSummary.totalAttempts}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Problems Solved ({overallSummary.accuracyPct}%)</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>
                {gradeSummary.masteredCount} / {gradeSummary.totalStandards}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{gradeObj.label} Standards Mastered</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>
                🔥 {overallSummary.bestStreak}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Best Correct Streak</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7' }}>
                {gradeSummary.overallMasteryPct}%
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{gradeObj.label} Overall Mastery</div>
            </div>
          </div>

          {/* Domain Mastery Progress Bars */}
          <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>
            📊 {gradeObj.label} California CCSS-M Domain Mastery
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {domainBreakdown.map((dom) => (
              <div key={dom.code} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(150,150,150,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span>
                    <span className="code-pill" style={{ marginRight: '8px' }}>{dom.code}</span>
                    {dom.name}
                  </span>
                  <span>
                    {dom.masteredCount}/{dom.totalCount} Mastered ({dom.masteryPct}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(150,150,150,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${dom.masteryPct}%`,
                      height: '100%',
                      background: dom.masteryPct >= 80 ? '#10b981' : '#6366f1',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Achievements Grid */}
          <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>
            🏅 Scholar Achievements ({achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked)
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
