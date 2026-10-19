import GuidedLesson from './GuidedLesson.jsx';
import { buildLessonGuide } from '../game/coachGuide.js';
import React, { useState, useEffect } from 'react';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';
import NumberPad from './NumberPad.jsx';
import BipCompanion from './BipCompanion.jsx';
import ScratchpadCanvas from './ScratchpadCanvas.jsx';

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

/**
 * Splits a question prompt into plain text and highlighted math tokens
 * (numbers, fractions, equations, dollar/cent values, and unknown '?' boxes)
 * so young learners can immediately spot the mathematical quantities.
 */
function renderHighlightedPrompt(promptText) {
  if (!promptText) return null;
  const text = String(promptText);
  const tokenRegex = /(\b\d+\s*[+−\-×÷=]\s*\d+(?:\s*[+−\-×÷=]\s*(?:\d+|\?))?|\[\s*\?\s*\]|\b\d+\/\d+\b|\$\d+(?:\.\d+)?|\b\d+(?:,\d{3})*(?:\.\d+)?(?:¢|°)?\b)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (tokenRegex.test(part)) {
      tokenRegex.lastIndex = 0;
      const isUnknownBox = part.includes('?');
      return (
        <span
          key={idx}
          className={`kid-math-token ${isUnknownBox ? 'token-unknown' : ''}`}
        >
          {part}
        </span>
      );
    }
    tokenRegex.lastIndex = 0;
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

const CELEBRATION_EMOJIS = ['🌟', '✨', '🎉', '⭐', '🚀', '🏆', '💫', '🎊'];

export default function QuestionCard({
  question,
  onAnswer,
  onSkip,
  onNextAfterAnswer,
  onPracticeSimilar,
  onGuideOpen,
  onRetry,
  timeLeft,
  totalTime,
  feedback, // { status: 'correct' | 'incorrect', answer }
  eventKey = 0,
  isSaving = false,
  showHints,
  streak = 0,
  correctCount = 0,
  soundEnabled = false,
  studentName = '',
}) {
  const [hintVisible, setHintVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mistakeChoice,setMistakeChoice]=useState(false);
  useEffect(()=>{if(feedback?.status==='incorrect'){setMistakeChoice(true);setGuideOpen(false);setExplanationVisible(false);setHintVisible(false);}},[feedback]);
  const guide = buildLessonGuide(question);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [useKeypad, setUseKeypad] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [eliminatedOption, setEliminatedOption] = useState(null);

  useEffect(() => {
    setHintVisible(false);
    setGuideOpen(false);
    setExplanationVisible(false);
    setManualInput('');
    setHoveredOption(null);
    setEliminatedOption(null);

    // Auto-read aloud for Kindergarten & 1st Grade early readers when sound is explicitly enabled
    if (
      soundEnabled &&
      question?.prompt &&
      (question.grade === 'K' || question.grade === '1')
    ) {
      speakMathText(question.prompt);
    }
  }, [question?.id, question?.prompt, question?.grade, soundEnabled]);



  if (!question) {
    return <div className="card loading-card">Preparing a checked question...</div>;
  }

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (manualInput.trim()) {
      onAnswer(manualInput.trim());
      setManualInput('');
    }
  };

  // Let Bip laser-zap 1 wrong multiple-choice distractor so Bip directly helps with the answers!
  const handleBipEliminateOption = () => {
    if (eliminatedOption !== null || !Array.isArray(question.options)) return;
    onGuideOpen?.(true);
    const wrongChoices = question.options.filter(
      (opt) => String(opt).trim().toLowerCase() !== String(question.correctAnswer).trim().toLowerCase()
    );
    if (wrongChoices.length > 0) {
      const picked = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      setEliminatedOption(picked);
    }
  };

  const timerPct = totalTime > 0 ? Math.max(0, (timeLeft / totalTime) * 100) : 100;
  const hasMultipleChoice = Array.isArray(question.options) && question.options.length > 0;
  const questStarProgress = correctCount % 5;

  // Map game state to Bip's live interactive states
  let bipEvent = 'idle';
  if (isSaving) {
    bipEvent = 'saving';
  } else if (feedback?.status === 'correct') {
    bipEvent = 'correct';
  } else if (feedback?.status === 'incorrect') {
    bipEvent = 'tryAgain';
  } else if (hintVisible || explanationVisible || scratchpadOpen || hoveredOption !== null) {
    bipEvent = 'thinking';
  }

  return (
    <div className={`question-card kid-question-card ${feedback ? `feedback-${feedback.status}` : ''}`} data-mistake-choice={mistakeChoice}>
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

      {/* Main Question Prompt + Read-Aloud Speaker Button + Highlighted Math Tokens */}
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
        <h2 className="question-prompt">
          {renderHighlightedPrompt(question.prompt)}
        </h2>
      </div>

      {/* Manipulative Visual if present */}
      {question.manipulative && question.manipulative.type!=='fraction' && (
        <VisualManipulative manipulative={question.manipulative} />
      )}

      <GuidedLesson key={`guide-${question.id}`} question={question} open={guideOpen}
        onOpen={() => { setGuideOpen(true); onGuideOpen?.(true); }}
        onClose={() => { setGuideOpen(false); onGuideOpen?.(false); }}
        onPracticeSimilar={onPracticeSimilar} onSpeak={speakMathText} />

      {/* On-Screen Kid's Math Scratchpad & Doodle Canvas */}
      {scratchpadOpen && (
        <ScratchpadCanvas questionId={question.id || question.prompt} question={question} />
      )}

      {/* Big Beautiful Answer Tiles (Interactive with Bip Hover & 50/50 Laser Zap!) */}
      <div className="answers-container">
        {hasMultipleChoice && !useKeypad ? (
          <div className="options-grid kid-options-grid">
            {question.options.map((opt, idx) => {
              const isSelectedFeedback =
                feedback && String(feedback.answer) === String(opt);
              const isCorrectFeedback =
                feedback?.status === 'correct' && String(question.correctAnswer) === String(opt);
              const isZappedByBip =
                !feedback &&
                eliminatedOption !== null &&
                String(eliminatedOption) === String(opt);

              let btnClass = `option-btn kid-option-btn option-color-${idx % 4}`;
              if (isZappedByBip) {
                btnClass += ' bip-zapped-option';
              }
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
                  disabled={Boolean(feedback) || isZappedByBip}
                  onMouseEnter={() => !feedback && !isZappedByBip && setHoveredOption(opt)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onFocus={() => !feedback && !isZappedByBip && setHoveredOption(opt)}
                  onBlur={() => setHoveredOption(null)}
                  onClick={() => onAnswer(opt)}
                >
                  <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-value">
                    {isZappedByBip ? `⚡ ${String(opt)} (Ruled Out)` : String(opt)}
                  </span>
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

      {/* Always-Active Interactive Bip Companion: Coaches on the question, scans hovered options, zaps 1 wrong choice, & celebrates answers! */}
      <BipCompanion
        event={bipEvent}
        eventKey={eventKey}
        studentName={studentName}
        streak={streak}
        correctCount={correctCount}
        question={{ ...question, hint: guide.firstHint }}
        feedback={feedback}
        hoveredOption={hoveredOption}
        eliminatedOption={eliminatedOption}
        soundEnabled={soundEnabled}
        onAskHint={() => {
          setGuideOpen(true); onGuideOpen?.(true);
          setHintVisible(true);
          if (question.hint) speakMathText(guide.firstHint);
        }}
        onEliminateOption={handleBipEliminateOption}
        onSpeakExplanation={feedback?.status==='incorrect'?undefined:() => {
          setGuideOpen(true); onGuideOpen?.(true);
          setExplanationVisible(true);
          if (question.explanation) speakMathText(question.explanation);
        }}
        showControls
      />

      {/* Friendly Kid Helper Pills & Feedback Banner */}
      <div className="card-footer-row">
        {!feedback && (
          <div className="helper-buttons-row kid-helpers-row">
            <button
              type="button"
              className={`kid-helper-pill scratchpad-pill ${scratchpadOpen ? 'active' : ''}`}
              onClick={() => setScratchpadOpen((prev) => !prev)}
              title="Open drawing pad to draw number bonds, area models, or column math"
            >
              ✏️ {scratchpadOpen ? 'Hide Scratchpad' : 'Draw / Scratchpad'}
            </button>

            {showHints && question.hint && (
              <button
                type="button"
                className={`kid-helper-pill hint-pill ${hintVisible ? 'active' : ''}`}
                onClick={() => {
                  const next = !hintVisible;
                  setHintVisible(next);
                  if (next) { onGuideOpen?.(true); speakMathText(guide.firstHint); }
                }}
              >
                💡 {hintVisible ? 'Hide Hint' : 'Need a Hint?'}
              </button>
            )}

            {question.explanation && (
              <button
                type="button"
                className={`kid-helper-pill proof-pill ${explanationVisible ? 'active' : ''}`}
                onClick={() => { if (!explanationVisible) onGuideOpen?.(true); setExplanationVisible((prev) => !prev); }}
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
              <strong>Helpful Hint:</strong> {guide.firstHint}
            </div>
            <button
              type="button"
              className="mini-speak-btn"
              onClick={() => speakMathText(guide.firstHint)}
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
            {feedback.assisted && <p>{feedback.retried?'You kept trying. That’s part of learning.':'Practised with help. You can try a fresh question when you’re ready.'}</p>}
            <div className="feedback-row-content">
              {feedback.status === 'correct' ? (
                <span>
                  🌟 <strong>Awesome Job{studentName ? `, ${studentName}` : ''}!</strong>{' '}
                  {streak >= 2 ? `${streak} in a row! 🔥` : '100% Correct!'}
                </span>
              ) : (
                <span>
                  🌱 <strong>Not quite yet{studentName ? `, ${studentName}` : ''}—and that’s okay.</strong> What would you like to do?
                </span>
              )}
              {onNextAfterAnswer && feedback.status==='correct' && (
                <button
                  type="button"
                  className="kid-next-btn"
                  onClick={onNextAfterAnswer}
                >
                  Next Question ➔
                </button>
              )}
            </div>
            {feedback.status==='incorrect'&&<div className="mistake-choice-actions">{onRetry&&<button type="button" className="btn btn-primary" onClick={()=>{setMistakeChoice(false);setGuideOpen(false);setHintVisible(false);setExplanationVisible(false);setManualInput('');onRetry();}}>↻ Try again</button>}<button type="button" className="btn btn-secondary" onClick={()=>{setMistakeChoice(false);setGuideOpen(true);onGuideOpen?.(true);}}>💛 Break it down with Bip</button>{onNextAfterAnswer&&<button type="button" className="btn btn-secondary" onClick={onNextAfterAnswer}>Next question →</button>}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
