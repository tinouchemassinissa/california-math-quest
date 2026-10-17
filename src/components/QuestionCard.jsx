import React, { useState, useEffect } from 'react';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';
import NumberPad from './NumberPad.jsx';

export default function QuestionCard({
  question,
  onAnswer,
  timeLeft,
  totalTime,
  feedback, // { status: 'correct' | 'incorrect', answer }
  showHints,
}) {
  const [hintVisible, setHintVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [useKeypad, setUseKeypad] = useState(false);

  useEffect(() => {
    setHintVisible(false);
    setExplanationVisible(false);
    setManualInput('');
  }, [question?.id, question?.prompt]);

  useEffect(() => {
    if (feedback?.status === 'incorrect') {
      setExplanationVisible(true);
    }
  }, [feedback]);

  if (!question) {
    return <div className="card loading-card">Loading verified question...</div>;
  }

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (manualInput.trim()) {
      onAnswer(manualInput.trim());
      setManualInput('');
    }
  };

  const timerPct = totalTime > 0 ? Math.max(0, (timeLeft / totalTime) * 100) : 100;
  const hasMultipleChoice = Array.isArray(question.options) && question.options.length > 0;

  return (
    <div className={`question-card ${feedback ? `feedback-${feedback.status}` : ''}`}>
      {/* Top Bar: Standard tag, Verification Badge & Timer */}
      <div className="card-top-row">
        <div className="standard-tag">
          <span className="code-pill">{question.standard}</span>
          <span className="standard-name">{question.title}</span>
          <span className="verified-proof-badge" title="Formally checked by Mathematical Invariant Verifier">
            ✓ Formally Verified
          </span>
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

      {/* Answer Options or Free-Response Keypad */}
      <div className="answers-container">
        {hasMultipleChoice && !useKeypad ? (
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
          <div>
            <form className="manual-input-form" onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="text-input"
                placeholder="Type or tap your answer..."
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
            <NumberPad
              disabled={Boolean(feedback)}
              onDigit={(d) => setManualInput((prev) => `${prev}${d}`)}
              onBackspace={() => setManualInput((prev) => prev.slice(0, -1))}
              onClear={() => setManualInput('')}
              onSubmit={() => handleManualSubmit()}
            />
          </div>
        )}
      </div>

      {/* Step-by-Step Proof, Keypad Toggle & Hint Row */}
      <div className="card-footer-row">
        <div className="helper-buttons-row">
          {showHints && question.hint && (
            <button
              type="button"
              className="hint-toggle-btn"
              onClick={() => setHintVisible((prev) => !prev)}
            >
              💡 {hintVisible ? 'Hide Hint' : 'Need a Hint?'}
            </button>
          )}

          {question.explanation && (
            <button
              type="button"
              className="step-proof-btn"
              onClick={() => setExplanationVisible((prev) => !prev)}
            >
              📐 {explanationVisible ? 'Hide Step-by-Step Proof' : 'View Step-by-Step Proof'}
            </button>
          )}

          {hasMultipleChoice && (
            <button
              type="button"
              className="step-proof-btn"
              onClick={() => setUseKeypad((prev) => !prev)}
              title="Switch between Multiple Choice and Touchscreen Keypad mode"
            >
              🔢 {useKeypad ? 'Multiple Choice Mode' : 'Keypad / Free Response'}
            </button>
          )}
        </div>

        {hintVisible && question.hint && (
          <div className="hint-callout">
            <span className="hint-icon">💡</span> <strong>Hint:</strong> {question.hint}
          </div>
        )}

        {explanationVisible && question.explanation && (
          <div className="explanation-callout">
            <span className="proof-icon">📐</span>
            <div>
              <strong>Step-by-Step Mathematical Proof:</strong>
              <p>{question.explanation}</p>
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback-alert ${feedback.status}`}>
            {feedback.status === 'correct' ? (
              <span>🌟 Excellent! 100% Correct!</span>
            ) : (
              <span>
                ❌ Nice try! The mathematically verified answer is <strong>{String(question.correctAnswer)}</strong>.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
