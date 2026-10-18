import React, { useState, useEffect } from 'react';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';
import NumberPad from './NumberPad.jsx';
import MathTamagotchi from './MathTamagotchi.jsx';

function speakMathText(rawText) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !rawText) return;
  try {
    window.speechSynthesis.cancel();
    const spoken = String(rawText)
      .replace(/×/g, ' times ')
      .replace(/÷/g, ' divided by ')
      .replace(/−|-/g, ' minus ')
      .replace(/\+/g, ' plus ')
      .replace(/=/g, ' equals ')
      .replace(/\?/g, ' what number ')
      .replace(/≥/g, ' is greater than or equal to ')
      .replace(/≤/g, ' is less than or equal to ')
      .replace(/>/g, ' is greater than ')
      .replace(/</g, ' is less than ')
      .replace(/sq ft/gi, 'square feet')
      .replace(/sq m/gi, 'square meters')
      .replace(/sq cm/gi, 'square centimeters')
      .replace(/sq in/gi, 'square inches')
      .replace(/cu ft/gi, 'cubic feet')
      .replace(/cu m/gi, 'cubic meters')
      .replace(/cu cm/gi, 'cubic centimeters')
      .replace(/cu in/gi, 'cubic inches');

    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.rate = 0.94;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}

const CELEBRATION_EMOJIS = ['🌟', '✨', '🎉', '⭐', '🚀', '🏆', '💫', '🎊'];

export default function QuestionCard({
  question,
  onAnswer,
  onSkip,
  onNextAfterAnswer,
  timeLeft,
  totalTime,
  feedback, // { status: 'correct' | 'incorrect', answer }
  showHints,
  streak = 0,
  correctCount = 0,
  soundEnabled = true,
  petId = 'server-bot',
  studentName = '',
}) {
  const [hintVisible, setHintVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [standardDetailsOpen, setStandardDetailsOpen] = useState(false);
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
  const questStarProgress = correctCount % 5;

  return (
    <div className={`question-card kid-question-card ${feedback ? `feedback-${feedback.status}` : ''}`}>
      {/* Animated Celebration Confetti Burst ONLY after a Correct Answer */}
      {feedback?.status === 'correct' && (
        <div className="celebration-burst" aria-hidden="true">
          {CELEBRATION_EMOJIS.map((emoji, idx) => (
            <span key={idx} className={`confetti-piece confetti-${idx}`}>
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Clean Top Bar: Skill Title, 5-Star Quest Progress, Timer & Skip */}
      <div className="card-top-row kid-card-top">
        <div className="kid-skill-header">
          <span className="kid-skill-pill">🌟 {question.title}</span>
          <button
            type="button"
            className="standard-info-chip"
            onClick={() => setStandardDetailsOpen((v) => !v)}
            title="Click to view official California CCSS-M & CAASPP standard details"
          >
            ℹ️ {question.standard} {standardDetailsOpen ? '▲' : '▼'}
          </button>
        </div>

        <div className="kid-top-right">
          <div className="quest-stars-mini" title={`${questStarProgress} of 5 stars toward your next milestone!`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`mini-quest-star ${i < questStarProgress ? 'earned' : ''}`}
              >
                {i < questStarProgress ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          {totalTime > 0 && (
            <div className="timer-wrapper">
              <div className={`timer-clock ${timeLeft <= 5 ? 'timer-urgent-text' : ''}`}>
                ⏱️ {timeLeft}s
              </div>
              <div className="timer-bar-track">
                <div
                  className={`timer-bar-fill ${timeLeft <= 5 ? 'timer-urgent' : ''}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>
          )}

          {onSkip && !feedback && (
            <button
              type="button"
              className="kid-skip-pill"
              onClick={onSkip}
              title="Try a different question"
            >
              Skip ➔
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Official California Educator Metadata Drawer */}
      {standardDetailsOpen && (
        <div className="educator-standard-drawer">
          <span className="code-pill">CA CCSS-M {question.standard}</span>
          {question.module && (
            <span className="verified-proof-badge" style={{ background: 'rgba(139, 92, 246, 0.14)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.35)' }}>
              📘 {question.module}
            </span>
          )}
          {question.caasppClaim && (
            <span className="verified-proof-badge" style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.35)' }}>
              🎯 {question.caasppClaim}
            </span>
          )}
          {question.dokLevel && (
            <span className="verified-proof-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
              ⚡ {question.dokLevel}
            </span>
          )}
          <span className="verified-proof-badge">✓ Formally Verified</span>
        </div>
      )}

      {/* Main Question Prompt + Read-Aloud Speaker Button */}
      <div className="question-prompt-box kid-prompt-row">
        <button
          type="button"
          className="read-aloud-btn"
          onClick={() => speakMathText(question.prompt)}
          title="Read this math question out loud!"
          aria-label="Read question aloud"
        >
          🔊
        </button>
        <h2 className="question-prompt">{question.prompt}</h2>
      </div>

      {/* Manipulative Visual if present */}
      {question.manipulative && (
        <VisualManipulative manipulative={question.manipulative} />
      )}

      {/* Big Beautiful Answer Tiles */}
      <div className="answers-container">
        {hasMultipleChoice && !useKeypad ? (
          <div className="options-grid kid-options-grid">
            {question.options.map((opt, idx) => {
              const isSelectedFeedback =
                feedback && String(feedback.answer) === String(opt);
              const isCorrectFeedback =
                feedback && String(question.correctAnswer) === String(opt);

              let btnClass = `option-btn kid-option-btn option-color-${idx % 4}`;
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
                Check Answer! 🚀
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

      {/* ONLY AFTER ANSWERING: Pop Up the Animated Tamagotchi Celebration Stage! */}
      {feedback && (
        <MathTamagotchi
          feedback={feedback}
          streak={streak}
          correctCount={correctCount}
          soundEnabled={soundEnabled}
          speciesId={petId}
          studentName={studentName}
        />
      )}

      {/* Friendly Kid Helper Pills & Feedback Banner */}
      <div className="card-footer-row">
        {!feedback && (
          <div className="helper-buttons-row kid-helpers-row">
            {showHints && question.hint && (
              <button
                type="button"
                className={`kid-helper-pill hint-pill ${hintVisible ? 'active' : ''}`}
                onClick={() => {
                  const next = !hintVisible;
                  setHintVisible(next);
                  if (next) speakMathText(question.hint);
                }}
              >
                💡 {hintVisible ? 'Hide Hint' : 'Need a Hint?'}
              </button>
            )}

            {question.explanation && (
              <button
                type="button"
                className={`kid-helper-pill proof-pill ${explanationVisible ? 'active' : ''}`}
                onClick={() => setExplanationVisible((prev) => !prev)}
              >
                📐 {explanationVisible ? 'Hide How to Solve' : 'Show How to Solve'}
              </button>
            )}

            {hasMultipleChoice && (
              <button
                type="button"
                className="kid-helper-pill keypad-pill"
                onClick={() => setUseKeypad((prev) => !prev)}
                title="Switch between Multiple Choice and Number Pad"
              >
                🔢 {useKeypad ? '4 Choices (A-D)' : 'Type Answer'}
              </button>
            )}
          </div>
        )}

        {hintVisible && question.hint && (
          <div className="hint-callout animated-pop">
            <span className="hint-icon">💡</span>
            <div style={{ flex: 1 }}>
              <strong>Helpful Hint:</strong> {question.hint}
            </div>
            <button
              type="button"
              className="mini-speak-btn"
              onClick={() => speakMathText(question.hint)}
              title="Read hint aloud"
            >
              🔊
            </button>
          </div>
        )}

        {explanationVisible && question.explanation && (
          <div className="explanation-callout animated-pop">
            <span className="proof-icon">📐</span>
            <div style={{ flex: 1 }}>
              <strong>How It Works (Step-by-Step):</strong>
              <p>{question.explanation}</p>
            </div>
            <button
              type="button"
              className="mini-speak-btn"
              onClick={() => speakMathText(question.explanation)}
              title="Read explanation aloud"
            >
              🔊
            </button>
          </div>
        )}

        {feedback && (
          <div className={`feedback-alert animated-pop ${feedback.status}`}>
            <div className="feedback-row-content">
              {feedback.status === 'correct' ? (
                <span>
                  🌟 <strong>Awesome Job{studentName ? `, ${studentName}` : ''}!</strong>{' '}
                  {streak >= 2 ? `${streak} in a row! 🔥` : '100% Correct!'}
                </span>
              ) : (
                <span>
                  🌱 <strong>Good try{studentName ? `, ${studentName}` : ''}!</strong> The correct answer is{' '}
                  <strong>{String(question.correctAnswer)}</strong>.
                </span>
              )}
              {onNextAfterAnswer && (
                <button
                  type="button"
                  className="kid-next-btn"
                  onClick={onNextAfterAnswer}
                >
                  Next Question ➔
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
