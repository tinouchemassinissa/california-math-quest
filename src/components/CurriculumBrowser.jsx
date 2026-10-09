import React, { useState } from 'react';
import { GRADES, DOMAINS, MODULES, STANDARDS } from '../data/californiaCurriculum.js';

export default function CurriculumBrowser({
  isOpen,
  onClose,
  learnerProfile,
  onPracticeStandard,
}) {
  if (!isOpen) return null;

  const [selectedGrade, setSelectedGrade] = useState(learnerProfile?.grade || '3');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [viewMode, setViewMode] = useState('modules'); // 'modules' or 'standards'

  const gradeModules = Object.values(MODULES).filter((m) => m.grade === selectedGrade);

  const filteredStandards = Object.values(STANDARDS).filter((std) => {
    const matchGrade = std.grade === selectedGrade;
    const matchDomain = selectedDomain === 'ALL' || std.domain === selectedDomain;
    return matchGrade && matchDomain;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📐</span>
            <div>
              <h2>California Elementary Mathematics Framework</h2>
              <div className="modal-sub-title">Aligned with Eureka Math (A Story of Units) & CA CCSSM (Grades K–5)</div>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Grade selection tabs */}
          <div className="grade-tabs">
            {GRADES.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`tab-btn ${selectedGrade === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGrade(g.id)}
              >
                {g.icon} {g.label} ({g.modulesCount} Modules)
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-bar">
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`pill-btn ${viewMode === 'modules' ? 'active' : ''}`}
                onClick={() => setViewMode('modules')}
              >
                📚 Grade Modules & Units ({gradeModules.length})
              </button>
              <button
                type="button"
                className={`pill-btn ${viewMode === 'standards' ? 'active' : ''}`}
                onClick={() => setViewMode('standards')}
              >
                🎯 Standards by Domain ({filteredStandards.length})
              </button>
            </div>
          </div>

          {viewMode === 'modules' ? (
            <div className="modules-list-container">
              <div className="module-grid-cards">
                {gradeModules.map((mod) => (
                  <div key={mod.id} className="curriculum-module-card">
                    <div className="mod-header">
                      <span className="mod-badge">Module {mod.number}</span>
                      <span className="mod-grade-tag">Grade {mod.grade}</span>
                    </div>
                    <h4 className="mod-title">{mod.title}</h4>
                    <div className="mod-standards-list">
                      <strong>Target Standards:</strong>
                      <div className="mod-tags">
                        {mod.standards.map((stCode) => (
                          <span key={stCode} className="code-pill mini">{stCode}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary mod-practice-btn"
                      onClick={() => {
                        onPracticeStandard(mod.standards[0]);
                        onClose();
                      }}
                    >
                      Practice Module {mod.number} 🚀
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Domain Filter */}
              <div className="domain-filter-row">
                <label>Filter by Domain:</label>
                <button
                  type="button"
                  className={`pill-btn ${selectedDomain === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedDomain('ALL')}
                >
                  All Domains
                </button>
                {Object.values(DOMAINS).filter((d) => d.grades.includes(selectedGrade)).map((dom) => (
                  <button
                    key={dom.code}
                    type="button"
                    className={`pill-btn ${selectedDomain === dom.code ? 'active' : ''}`}
                    onClick={() => setSelectedDomain(dom.code)}
                  >
                    {dom.name} ({dom.code})
                  </button>
                ))}
              </div>

              {/* Standards List */}
              <div className="standards-cards-list">
                {filteredStandards.map((std) => {
                  const stats = learnerProfile?.standards?.[std.code] || { attempts: 0, correct: 0, mastery: 0 };
                  const masteryPct = Math.round((stats.mastery || 0) * 100);
                  const isMastered = stats.mastery >= 0.8;

                  return (
                    <div key={std.code} className={`standard-item-card ${isMastered ? 'mastered' : ''}`}>
                      <div className="std-header">
                        <div className="std-code-title">
                          <span className="code-pill">{std.code}</span>
                          <h4>{std.title}</h4>
                        </div>
                        <div className="mastery-indicator">
                          {isMastered ? (
                            <span className="mastery-badge">⭐ Mastered ({masteryPct}%)</span>
                          ) : stats.attempts > 0 ? (
                            <span className="learning-badge">📘 Learning ({masteryPct}%)</span>
                          ) : (
                            <span className="unseen-badge">⚪ Unseen</span>
                          )}
                        </div>
                      </div>

                      <div className="std-cluster-tag">
                        <strong>Official Cluster:</strong> {std.cluster}
                      </div>

                      <p className="std-desc">{std.desc}</p>

                      <div className="std-footer">
                        <div className="std-stats">
                          <span>Attempts: {stats.attempts}</span> • <span>Correct: {stats.correct}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            onPracticeStandard(std.code);
                            onClose();
                          }}
                        >
                          Practice Standard 🚀
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
