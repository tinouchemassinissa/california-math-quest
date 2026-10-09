import React, { useState } from 'react';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';

export default function QuestionCard({
  question,
  onAnswer,
  timeLeft,
  totalTime,
  feedback, // { status: 'correct' | 'incorrect', answer }
  showHints,
}) {
  const [hintVisible, setHintVisible] = useState(false);
  const [manualInput, setManualInput] = useState('');

  if (!question) {
    return <div className="card loading-card">Loading question...</div>;
  }

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (manualInput.trim()) {
      onAnswer(manualInput.trim());
      setManualInput('');
    }
  };

  const timerPct = totalTime > 0 ? Math.max(0, (timeLeft / totalTime) * 100) : 100;

  return (
    <div className={`question-card ${feedback ? `feedback-${feedback.status}` : ''}`}>
      {/* Top Bar: Standard tag & Timer */}
      <div className="card-top-row">
        <div className="standard-tag">
          <span className="code-pill">{question.standard}</span>
          <span className="standard-name">{question.title}</span>
        </div>

        {totalTime > 0 && (
          <div className="timer-wrapper">
            <div className="timer-clock">⏱️ {timeLeft}s</div>
            <div className="timer-bar-track">
              <div
                className={`timer-bar-fill ${timeLeft <= 5 ? 'timer-urgent' : ''}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Question Text */}
      <div className="question-prompt-box">
        <h2 className="question-prompt">{question.prompt}</h2>
      </div>

      {/* Manipulative Visual if present */}
      {question.manipulative && (
        <VisualManipulative manipulative={question.manipulative} />
      )}

      {/* Answer Options */}
      <div className="answers-container">
        {question.options && question.options.length > 0 ? (
          <div className="options-grid">
            {question.options.map((opt, idx) => {
              const isSelectedFeedback =
                feedback && String(feedback.answer) === String(opt);
              const isCorrectFeedback =
                feedback && String(question.correctAnswer) === String(opt);

              let btnClass = 'option-btn';
              if (feedback) {
                if (isCorrectFeedback) btnClass += ' correct-reveal';
                else if (isSelectedFeedback && feedback.status === 'incorrect') {
                  btnClass += ' incorrect-selection';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={btnClass}
                  disabled={Boolean(feedback)}
                  onClick={() => onAnswer(opt)}
                >
                  <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-value">{String(opt)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <form className="manual-input-form" onSubmit={handleManualSubmit}>
            <input
              type="text"
              className="text-input"
              placeholder="Type your answer..."
              value={manualInput}
              disabled={Boolean(feedback)}
              onChange={(e) => setManualInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={Boolean(feedback) || !manualInput.trim()}
            >
              Submit
            </button>
          </form>
        )}
      </div>

      {/* Hint & Feedback Banner */}
      <div className="card-footer-row">
        {showHints && question.hint && (
          <button
            type="button"
            className="hint-toggle-btn"
            onClick={() => setHintVisible((prev) => !prev)}
          >
            💡 {hintVisible ? 'Hide Hint' : 'Need a Hint?'}
          </button>
        )}

        {hintVisible && question.hint && (
          <div className="hint-callout">
            <span className="hint-icon">💡</span> {question.hint}
          </div>
        )}

        {feedback && (
          <div className={`feedback-alert ${feedback.status}`}>
            {feedback.status === 'correct' ? (
              <span>🌟 Excellent! Correct answer!</span>
            ) : (
              <span>
                ❌ Nice try! The correct answer was <strong>{String(question.correctAnswer)}</strong>.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
