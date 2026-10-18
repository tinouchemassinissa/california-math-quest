import React, { useEffect, useRef, useState } from 'react';

// Official Bip 4K60 MP4 clips in public/bip/*
// Deliberately avoids Bip_critical_4K60.mp4 for wrong answers so children are never frightened or shamed.
export const BIP_CLIPS = {
  idle: ['events/Bip_healthy_4K60.mp4', true, 'Bip is ready whenever you are!'],
  thinking: ['events/Bip_busy_4K60.mp4', true, 'Let’s think together step by step.'],
  correct: ['greeting.mp4', false, 'Well done! Awesome math thinking!'],
  tryAgain: ['events/Bip_healthy_4K60.mp4', false, 'Good try! Let’s look at another way together.'],
  recovery: ['events/Bip_recovery_4K60.mp4', false, 'You bounced right back! Keep going!'],
  rest: ['events/Bip_sleep_4K60.mp4', true, 'Time for a calm little rest.'],
  saving: ['events/Bip_backup_4K60.mp4', true, 'Saving your math progress safely.'],
};

export default function BipCompanion({
  event = 'idle',
  eventKey = 0,
  baseUrl = '/bip',
  customMessage = null,
  studentName = '',
  streak = 0,
  compact = false,
  showControls = true,
  onComplete,
}) {
  const videoRef = useRef(null);
  const callbackRef = useRef(onComplete);

  const [paused, setPaused] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [manualEvent, setManualEvent] = useState(null);
  const [manualTrigger, setManualTrigger] = useState(0);
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  // Reset settled/manual override whenever the game triggers a new event or attempt
  useEffect(() => {
    setSettled(false);
    setFailed(false);
    setManualEvent(null);
  }, [event, eventKey]);

  const activeKey = manualEvent || (settled ? 'idle' : BIP_CLIPS[event] ? event : 'idle');
  const [path, loop, defaultLabel] = BIP_CLIPS[activeKey] || BIP_CLIPS.idle;
  const fullSrc = `${baseUrl}/${path}`;

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    // Safely restart or play the clip
    try {
      if (element.readyState >= 1) {
        element.currentTime = 0;
      }
    } catch {
      // Ignore if metadata is still loading; video starts at 0 by default
    }

    if (paused) {
      element.pause();
    } else {
      const playPromise = element.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  }, [fullSrc, eventKey, paused, manualTrigger]);

  const handleVideoLoadedData = () => {
    const element = videoRef.current;
    if (!element) return;
    setFailed(false);
    if (paused) {
      element.pause();
    } else {
      const playPromise = element.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  };

  const namePrefix = studentName?.trim() ? `${studentName.trim()}, ` : '';
  let statusText = customMessage || defaultLabel;

  if (!customMessage) {
    if (manualEvent === 'correct') {
      statusText = `Hi ${studentName?.trim() || 'friend'}! Let’s have fun with math today!`;
    } else if (!manualEvent && activeKey === 'correct') {
      statusText =
        streak >= 3
          ? `Well done, ${studentName?.trim() || 'math explorer'}! ${streak} in a row!`
          : `Well done${studentName?.trim() ? `, ${studentName.trim()}` : ''}! You solved it!`;
    } else if (!manualEvent && activeKey === 'tryAgain') {
      statusText = `Gentle retry: ${namePrefix}let’s look at the steps together—you can do this!`;
    }
  }

  return (
    <section
      className={`bip-companion-card ${compact ? 'bip-compact' : ''} state-${activeKey}`}
      aria-label="Bip, your ivory-and-brass robot math companion"
    >
      <div className="bip-video-frame">
        <video
          ref={videoRef}
          src={fullSrc}
          muted
          playsInline
          autoPlay={!paused}
          loop={loop}
          preload="auto"
          aria-hidden="true"
          className="bip-video-element"
          onLoadedData={handleVideoLoadedData}
          onError={() => setFailed(true)}
          onEnded={() => {
            if (!loop) {
              setSettled(true);
              setManualEvent(null);
              callbackRef.current?.(activeKey);
            }
          }}
        />
        <span className="bip-status-badge">
          🤖 Bip • {activeKey === 'correct' ? (manualEvent ? 'Waving' : 'Celebrating') : activeKey === 'tryAgain' ? 'Encouraging' : activeKey === 'thinking' ? 'Thinking' : activeKey === 'rest' ? 'Resting' : activeKey === 'saving' ? 'Saving' : 'Ready'}
        </span>
      </div>

      <div className="bip-companion-body">
        <div className="bip-message-area">
          <div className="bip-companion-title">
            <strong>Bip</strong>
            <span className="bip-sub-badge">Ivory & Brass Companion</span>
          </div>
          <p role="status" aria-live="polite" className="bip-status-text">
            {failed ? 'Bip is taking a quick break. You can keep playing!' : statusText}
          </p>
        </div>

        {showControls && (
          <div className="bip-controls-row">
            <button
              type="button"
              className="bip-ctrl-btn"
              onClick={() => setPaused((v) => !v)}
            >
              {paused ? '▶️ Play' : '⏸️ Pause'}
            </button>

            <button
              type="button"
              className={`bip-ctrl-btn ${manualEvent === 'correct' ? 'active' : ''}`}
              onClick={() => {
                setPaused(false);
                setSettled(false);
                setManualEvent('correct');
                setManualTrigger((c) => c + 1);
              }}
              title="Ask Bip to wave hello"
            >
              👋 Wave Hello
            </button>

            <button
              type="button"
              className={`bip-ctrl-btn ${manualEvent === 'thinking' ? 'active' : ''}`}
              onClick={() => {
                setPaused(false);
                setSettled(false);
                setManualEvent((prev) => (prev === 'thinking' ? null : 'thinking'));
                setManualTrigger((c) => c + 1);
              }}
              title="See Bip thinking"
            >
              🤔 Think
            </button>

            <button
              type="button"
              className={`bip-ctrl-btn ${manualEvent === 'rest' ? 'active' : ''}`}
              onClick={() => {
                setPaused(false);
                setSettled(false);
                setManualEvent((prev) => (prev === 'rest' ? null : 'rest'));
                setManualTrigger((c) => c + 1);
              }}
              title="Let Bip rest"
            >
              😴 {manualEvent === 'rest' ? 'Wake' : 'Rest'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
