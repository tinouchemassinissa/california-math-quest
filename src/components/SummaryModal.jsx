import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SummaryModal({
  isOpen,
  onClose,
  score,
  streak,
  correctCount,
  totalAnswered,
  onPlayAgain,
  onReviewMistakes,
  hasMistakes,
  modeTitle,
}) {
  if (!isOpen) return null;

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">🎉</span>
            <h2>Round Complete!</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body text-center">
          <div className="summary-mode-title">{modeTitle || 'Challenge'} Completed</div>

          <div className="summary-stat-grid">
            <div className="summary-stat-box highlight">
              <div className="summary-label">Final Score</div>
              <div className="summary-val">{score}</div>
            </div>

            <div className="summary-stat-box">
              <div className="summary-label">Accuracy</div>
              <div className="summary-val">{accuracy}%</div>
              <div className="summary-sub">{correctCount} of {totalAnswered}</div>
            </div>

            <div className="summary-stat-box">
              <div className="summary-label">Best Streak</div>
              <div className="summary-val">{streak} 🔥</div>
            </div>
          </div>

          <div className="summary-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onPlayAgain}
            >
              Play Again 🚀
            </button>

            {hasMistakes && (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={onReviewMistakes}
              >
                Review Mistakes 🎯
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
