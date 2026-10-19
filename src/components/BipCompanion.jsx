import SmoothBipVideo from './SmoothBipVideo.jsx';
import React, { useEffect, useRef, useState } from 'react';
import {
  playTamagotchiChomp,
  playTamagotchiGiggle,
  playTamagotchiDance,
  playStreakChime,
} from '../audio.js';

// Teaching gestures rendered from the original Bip Blender scene, 720px / 30fps.
// Deliberately avoids Bip_critical_4K60.mp4 for wrong answers so children are never frightened or shamed.
export const BIP_CLIPS = {
  idle: ['gestures-v2/idle.mp4', true, 'Bip is ready to help you solve this question!'],
  thinking: ['gestures-v2/think.mp4', false, 'Scanning the math numbers step by step...'],
  correct: ['gestures-v2/nod.mp4', false, 'BOOM! Power-Up Celebration! You nailed it!'],
  celebrate: ['gestures-v2/celebrate.mp4', false, '🎉 PARTY TIME! Bip is doing a victory power-up for you!'],
  fireStreak: ['gestures-v2/celebrate.mp4', false, '🔥 OVERDRIVE STREAK! Bip is on fire from your math combo!'],
  starVault: ['gestures-v2/nod.mp4', false, '🌟 STAR LOCKED IN! Bip beamed your points into the Trophy Vault!'],
  wave: ['gestures-v2/wave.mp4', false, 'Hi friend! Ready for your next big math adventure?'],
  tryAgain: ['gestures-v2/encourage.mp4', false, 'Good try! Let’s bounce right back and see how it works!'],
  recovery: ['gestures-v2/nod.mp4', false, 'You bounced right back! Keep going!'],
  rest: ['gestures-v2/rest.mp4', true, 'Time for a calm little power nap.'],
  saving: ['gestures-v2/think.mp4', true, 'Saving your math progress safely.'],
};

const CELEBRATION_SHOWS = [
  {
    clipKey: 'celebrate',
    stuntClass: 'stunt-disco-bounce',
    badge: '🎉 POWER-UP PARTY!',
    treat: '🍕',
    particles: ['🎉', '⭐', '⚡', '🍕', '✨', '🏆'],
    getLine: (name, ans, streak) =>
      `BEEP-BOOP-BOOM, ${name}! "${ans}" is 100% CORRECT! ${streak >= 2 ? `${streak}x Combo powered up my party thrusters!` : 'Watch me power-bounce!'}`,
  },
  {
    clipKey: 'fireStreak',
    stuntClass: 'stunt-fire-overdrive',
    badge: '🔥 TURBO OVERDRIVE!',
    treat: '🌮',
    particles: ['🔥', '🚀', '🌮', '💥', '🌟', '⚡'],
    getLine: (name, ans, streak) =>
      `WHOA ${name}! Answering "${ans}" set my circuits on FIRE! ${streak >= 2 ? `${streak} in a row—unstoppable!` : 'Maximum math power!'}`,
  },
  {
    clipKey: 'starVault',
    stuntClass: 'stunt-star-beam',
    badge: '🌟 STAR VAULT BEAM!',
    treat: '🍩',
    particles: ['🌟', '💎', '🍩', '✨', '🪐', '🏅'],
    getLine: (name, ans) =>
      `CRUNCH! Locked in "${ans}" for ${name} and beamed a Golden Star straight into your Cambrian Vault!`,
  },
  {
    clipKey: 'wave',
    stuntClass: 'stunt-victory-spin',
    badge: '🏆 VICTORY SALUTE!',
    treat: '🍦',
    particles: ['🏆', '🎊', '🍦', '💫', '🌟', '🎈'],
    getLine: (name, ans) =>
      `High-five, ${name}! "${ans}" solved the puzzle! You are a true Math Explorer!`,
  },
];

const TREATS = ['🍕', '🌮', '🍩', '🍓', '🍔', '🍦', '🍪'];

export function getBipEvolution(correctCount = 0) {
  if (correctCount >= 15) {
    return { level: 5, title: 'Cosmic Brass Legend', icon: '👑', nextAt: null, pct: 100 };
  }
  if (correctCount >= 10) {
    return { level: 4, title: 'Golden Eureka Master', icon: '🏆', nextAt: 15, pct: Math.round(((correctCount - 10) / 5) * 100) };
  }
  if (correctCount >= 6) {
    return { level: 3, title: 'Turbo Cyber Bot', icon: '⚡', nextAt: 10, pct: Math.round(((correctCount - 6) / 4) * 100) };
  }
  if (correctCount >= 2) {
    return { level: 2, title: 'Brass Math Scout', icon: '🌟', nextAt: 6, pct: Math.round(((correctCount - 2) / 4) * 100) };
  }
  return { level: 1, title: 'Rookie Companion', icon: '🤖', nextAt: 2, pct: Math.round((correctCount / 2) * 100) };
}

export default function BipCompanion({
  event = 'idle',
  eventKey = 0,
  baseUrl = '/bip',
  customMessage = null,
  studentName = '',
  streak = 0,
  correctCount = 0,
  question = null,
  feedback = null,
  hoveredOption = null,
  eliminatedOption = null,
  onAskHint = null,
  onEliminateOption = null,
  onSpeakExplanation = null,
  soundEnabled = true,
  compact = false,
  showControls = true,
  onComplete,
}) {
  const callbackRef = useRef(onComplete);
  const timers = useRef(new Set());
  const schedule = (callback, delay) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
    return timer;
  };
  useEffect(() => () => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.clear();
  }, []);

  const [paused, setPaused] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [manualEvent, setManualEvent] = useState(null);
  const [manualTrigger, setManualTrigger] = useState(0);
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);

  // Interactive celebration & treat state
  const [activeShowIndex, setActiveShowIndex] = useState(0);
  const [stuntClass, setStuntClass] = useState('');
  const [flyingTreat, setFlyingTreat] = useState(null);
  const [highFives, setHighFives] = useState(0);
  const [burstParticles, setBurstParticles] = useState([]);
  const [customBubble, setCustomBubble] = useState(null);

  const displayName = studentName?.trim() || 'Superstar';
  const evolution = getBipEvolution(correctCount);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const change = e => { if (e.matches) setPaused(true); };
    media?.addEventListener('change', change);
    return () => media?.removeEventListener('change', change);
  }, []);

  const triggerParticleBurst = (emojis = ['🎉', '⭐', '⚡', '🔥', '✨', '🏆']) => {
    setBurstParticles(emojis);
    schedule(() => {
      setBurstParticles([]);
    }, 1350);
  };

  // React to new question or answer attempt
  useEffect(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.clear();
    setBurstParticles([]);
    setSettled(false);
    setFailed(false);
    setManualEvent(null);
    setCustomBubble(null);

    if (event === 'correct' || feedback?.status === 'correct') {
      // Pick celebration show based on streak & eventKey so it's never just the same clip!
      const chosenIdx =
        streak >= 3
          ? 1 // Use the child-friendly celebration for a streak.
          : eventKey % CELEBRATION_SHOWS.length;
      const show = CELEBRATION_SHOWS[chosenIdx];
      setActiveShowIndex(chosenIdx);
      setStuntClass(show.stuntClass);
      setFlyingTreat(show.treat);
      triggerParticleBurst(show.particles);

      if (soundEnabled) {
        playTamagotchiChomp();
        schedule(() => playTamagotchiDance(), 280);
      }

      const timer = schedule(() => {
        setStuntClass('');
        setFlyingTreat(null);
      }, 2400);
      return () => clearTimeout(timer);
    } else if (event === 'tryAgain' || feedback?.status === 'incorrect') {
      setStuntClass('stunt-gentle-nod');
      setFlyingTreat(null);
      const timer = schedule(() => setStuntClass(''), 1200);
      return () => clearTimeout(timer);
    } else {
      setStuntClass('');
      setFlyingTreat(null);
    }
  }, [event, eventKey, feedback?.status, streak, soundEnabled]);

  // Determine which video clip to play
  const currentShow = CELEBRATION_SHOWS[activeShowIndex] || CELEBRATION_SHOWS[0];
  let resolvedEventKey = 'idle';

  if (manualEvent) {
    resolvedEventKey = manualEvent;
  } else if (settled) {
    resolvedEventKey = 'idle';
  } else if (event === 'correct' || feedback?.status === 'correct') {
    resolvedEventKey = currentShow.clipKey;
  } else if (hoveredOption !== null && !feedback) {
    resolvedEventKey = 'thinking';
  } else if (BIP_CLIPS[event]) {
    resolvedEventKey = event;
  }

  const [path, loop, defaultLabel] = BIP_CLIPS[resolvedEventKey] || BIP_CLIPS.idle;
  const fullSrc = `${baseUrl}/${path}`;

  // Interactive Actions kids can trigger on Bip
  const handlePartyCelebrate = () => {

    setSettled(false);
    const nextIdx = (activeShowIndex + 1) % CELEBRATION_SHOWS.length;
    const show = CELEBRATION_SHOWS[nextIdx];
    setActiveShowIndex(nextIdx);
    setManualEvent(show.clipKey);
    setManualTrigger((c) => c + 1);
    setStuntClass(show.stuntClass);
    triggerParticleBurst(show.particles);
    setCustomBubble(
      `🎉 PARTY MODE! Doing my ${show.badge} dance for ${displayName}!`
    );
    if (soundEnabled) playTamagotchiDance();
    schedule(() => setStuntClass(''), 1800);
  };

  const handleFireBoost = () => {

    setSettled(false);
    setManualEvent('fireStreak');
    setManualTrigger((c) => c + 1);
    setStuntClass('stunt-fire-overdrive');
    triggerParticleBurst(['🔥', '⚡', '🚀', '💥', '🌟', '🔥']);
    setCustomBubble(
      `🔥 OVERDRIVE ENGAGED! Bip’s brass core is at 1,000% math power, ${displayName}!`
    );
    if (soundEnabled) playStreakChime(streak + 3);
    schedule(() => setStuntClass(''), 1800);
  };

  const handleFeedTreat = () => {

    setSettled(false);
    const randomTreat = TREATS[Math.floor(Math.random() * TREATS.length)];
    setFlyingTreat(randomTreat);
    setManualEvent('celebrate');
    setManualTrigger((c) => c + 1);
    setStuntClass('stunt-disco-bounce');
    triggerParticleBurst([randomTreat, '😋', '⭐', '✨', randomTreat]);
    setCustomBubble(
      `NOM-NOM-CRUNCH! ${randomTreat} Delicious math fuel, ${displayName}! Thank you!`
    );
    if (soundEnabled) playTamagotchiChomp();
    schedule(() => {
      setFlyingTreat(null);
      setStuntClass('');
    }, 1800);
  };

  const handleHighFive = () => {

    setSettled(false);
    const nextCount = highFives + 1;
    setHighFives(nextCount);
    setManualEvent('wave');
    setManualTrigger((c) => c + 1);
    setStuntClass('stunt-victory-spin');
    triggerParticleBurst(['🙌', '⚡', '🌟', '🎉', '✨']);
    setCustomBubble(
      `🙌 CLANG-FIVE x${nextCount}! Brass-to-hand high-five, ${displayName}!`
    );
    if (soundEnabled) playTamagotchiGiggle();
    schedule(() => setStuntClass(''), 1400);
  };

  // Build context-aware interactive dialogue for questions, hover states, and answers
  let statusText = customBubble || customMessage || defaultLabel;
  let modeBadgeText = 'Ready to Coach';

  if (customBubble) {
    modeBadgeText = 'Interactive Mode';
  } else if (feedback?.status === 'correct' || event === 'correct') {
    modeBadgeText = currentShow.badge;
    statusText = currentShow.getLine(
      displayName,
      question?.correctAnswer ?? feedback?.answer ?? 'that',
      streak
    );
  } else if (feedback?.status === 'incorrect' || event === 'tryAgain') {
    modeBadgeText = '🌱 Bounce-Back Coach';
    statusText = `Good effort, ${displayName}. Would you like to try again, break it down with me, or try the next question?`;
  } else if (hoveredOption !== null && !feedback) {
    modeBadgeText = '🎯 Inspecting Choice';
    statusText = `Scanning choice "${hoveredOption}"... Does "${hoveredOption}" match your math steps, ${displayName}? Click to lock it in!`;
  } else if (eliminatedOption !== null && !feedback) {
    modeBadgeText = '⚡ 50/50 Laser Scanner';
    statusText = `⚡ ZAPPED! I scanned the equation and ruled out "${eliminatedOption}" so you can focus on the remaining choices!`;
  } else if (question && !feedback) {
    modeBadgeText = `📘 Coaching ${question.standard || 'Math'}`;
    statusText = `Let’s solve "${question.title}", ${displayName}! Hover an answer choice to scan it, or tap a helper button below!`;
  }

  const isCelebrating =
    feedback?.status === 'correct' ||
    event === 'correct' ||
    manualEvent === 'celebrate' ||
    manualEvent === 'fireStreak' ||
    manualEvent === 'starVault';

  return (
    <section
      className={`bip-companion-card ${compact ? 'bip-compact' : ''} state-${resolvedEventKey} ${
        isCelebrating ? 'bip-celebrating-glow' : ''
      }`}
      data-motion={paused?'paused':'playing'}
      aria-label="Bip, your interactive robot math companion"
    >
      {/* Local gesture stage, with optional celebration overlays. */}
      <div className={`bip-video-frame ${stuntClass}`}>
        <SmoothBipVideo src={fullSrc} eventKey={`${eventKey}-${manualTrigger}`} paused={paused} loop={loop}
          onReady={()=>setFailed(false)} onError={()=>setFailed(true)}
          onEnded={()=>{if(!loop){setSettled(true);setManualEvent(null);callbackRef.current?.(resolvedEventKey);}}}/>


        {/* Floating Particle Burst Overlay on Video Stage */}
        {burstParticles.length > 0 && (
          <div className="bip-stage-particles" aria-hidden="true">
            {burstParticles.map((p, idx) => (
              <span key={idx} className={`bip-particle bip-p-${idx % 6}`}>
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Flying Snack / Treat Overlay */}
        {flyingTreat && (
          <div className="bip-flying-treat" aria-hidden="true">
            <span className="treat-emoji">{flyingTreat}</span>
            <span className="treat-chomp-tag">YUM! +XP</span>
          </div>
        )}

        {/* Top-Right Streak / High-Five Combo Pill */}
        {(streak >= 2 || highFives > 0) && (
          <div className="bip-combo-badge">
            {streak >= 2 ? `🔥 ${streak}x Streak` : `🙌 ${highFives}x High-Five`}
          </div>
        )}

        <span className="bip-status-badge">
          {evolution.icon} Bip Lv.{evolution.level} • {modeBadgeText}
        </span>
      </div>

      {/* Right: Speech Bubble, Evolution Progress, and Question/Celebration Interaction Buttons */}
      <div className="bip-companion-body">
        <div className="bip-message-area">
          <div className="bip-companion-title">
            <strong>Bip</strong>
            <span className="bip-sub-badge">
              {evolution.icon} Lv.{evolution.level} {evolution.title}
            </span>
            {evolution.nextAt && (
              <span className="bip-xp-mini" title={`Solve ${evolution.nextAt - correctCount} more to level up Bip!`}>
                ⚡ {correctCount}/{evolution.nextAt} XP
              </span>
            )}
          </div>

          <p role="status" aria-live="polite" className="bip-status-text">
            {failed ? 'Bip is cheering you on! Keep going!' : statusText}
          </p>
        </div>

        {showControls && (
          <div className="bip-controls-row">
            {/* Question-Specific Interactive Helpers when solving a question */}
            {question && !feedback && onAskHint && question.hint && (
              <button
                type="button"
                className="bip-ctrl-btn bip-action-clue"
                onClick={() => {

                  setManualEvent('thinking');
                  setManualTrigger((c) => c + 1);
                  setCustomBubble(`💡 BIP CLUE: ${question.hint}`);
                  onAskHint();
                }}
                title="Ask Bip for a step-by-step clue on this question"
              >
                💡 Bip Clue
              </button>
            )}

            {question &&
              !feedback &&
              onEliminateOption &&
              Array.isArray(question.options) &&
              question.options.length > 2 && (
                <button
                  type="button"
                  className="bip-ctrl-btn bip-action-zap"
                  disabled={Boolean(eliminatedOption)}
                  onClick={() => {

                    setManualEvent('thinking');
                    setManualTrigger((c) => c + 1);
                    setStuntClass('stunt-star-beam');
                    triggerParticleBurst(['⚡', '🎯', '✨', '🔍']);
                    if (soundEnabled) playStreakChime(2);
                    onEliminateOption();
                    schedule(() => setStuntClass(''), 1200);
                  }}
                  title="Ask Bip to scan the choices and zap 1 wrong answer!"
                >
                  ⚡ {eliminatedOption ? '1 Choice Zapped!' : 'Zap 1 Wrong Choice'}
                </button>
              )}

            {/* Post-Answer Explanation Read-Aloud Button */}
            {feedback && question?.explanation && onSpeakExplanation && (
              <button
                type="button"
                className="bip-ctrl-btn bip-action-clue"
                onClick={onSpeakExplanation}
                title="Hear Bip read the step-by-step math explanation aloud"
              >
                🔊 Explain Why
              </button>
            )}

            {/* Interactive Celebration & Tamagotchi Action Buttons */}
            <button
              type="button"
              className={`bip-ctrl-btn bip-action-party ${
                manualEvent === 'celebrate' ? 'active' : ''
              }`}
              onClick={handlePartyCelebrate}
              title="Trigger Bip's Power-Up Party Celebration!"
            >
              🎉 Celebrate
            </button>

            <button
              type="button"
              className={`bip-ctrl-btn bip-action-fire ${
                manualEvent === 'fireStreak' ? 'active' : ''
              }`}
              onClick={handleFireBoost}
              title="Trigger Bip's Turbo Fire Overdrive!"
            >
              🔥 Fire Mode
            </button>

            <button
              type="button"
              className="bip-ctrl-btn bip-action-treat"
              onClick={handleFeedTreat}
              title="Toss a celebratory snack treat to Bip!"
            >
              🍕 Feed Treat
            </button>

            <button
              type="button"
              className="bip-ctrl-btn"
              onClick={handleHighFive}
              title="Give Bip a high-five!"
            >
              🙌 High-Five {highFives > 0 ? `(${highFives})` : ''}
            </button>

            <button
              type="button"
              className="bip-ctrl-btn"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? 'Resume Bip animation' : 'Pause Bip animation'}
              aria-pressed={paused}
              title={paused ? 'Resume video' : 'Pause video'}
            >
              {paused ? '▶️' : '⏸️'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
