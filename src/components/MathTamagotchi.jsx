import React, { useState, useEffect } from 'react';
import {
  playTamagotchiChomp,
  playTamagotchiGiggle,
  playTamagotchiDance,
} from '../audio.js';

const PET_SPECIES = [
  { id: 'server-bot', name: 'Byte-Bot', icon: '🤖', label: 'Server Bot' },
  { id: 'golden-bear', name: 'Barnaby', icon: '🐻', label: 'Golden Bear' },
  { id: 'sierra-dragon', name: 'Sparky', icon: '🐉', label: 'Dragon' },
];

const FUNNY_WIN_SKITS = [
  {
    dance: 'dance-disco',
    snack: '🍕',
    actionTag: '🪩 DISCO FEVER!',
    line: (name) => `BEEP-BOOP-BOOGIE! Way to go, ${name}! That answer powered up my Disco Core! 🪩🕺`,
  },
  {
    dance: 'dance-backflip',
    snack: '🌮',
    actionTag: '🤸‍♂️ DOUBLE BACKFLIP!',
    line: (name) => `CRUNCH!! Taco-powered 360° backflip for ${name}! You're unstoppable! 🌮🚀`,
  },
  {
    dance: 'dance-breakdance',
    snack: '🍩',
    actionTag: '🌀 HEADSPIN MODE!',
    line: (name) => `WHOA ${name}! That equation was so sweet I'm spinning on my head! 🍩🌀`,
  },
  {
    dance: 'dance-moonwalk',
    snack: '🍓',
    actionTag: '👟 SMOOTH MOONWALK!',
    line: (name) => `Hee-hee! Watch me moonwalk across the stage for ${name}'s correct answer! 🍓✨`,
  },
  {
    dance: 'dance-rocket',
    snack: '🍔',
    actionTag: '🚀 TURBO BOOST!',
    line: (name) => `NOM NOM! Thrusters at 1000%, ${name}! Launching to Planet Genius! 🍔🔥`,
  },
  {
    dance: 'dance-dj',
    snack: '🍦',
    actionTag: '🎧 DJ DROP!',
    line: (name) => `WIKI-WIKI-MATH! Dropping the freshest beats in California for ${name}! 🎧💿`,
  },
];

const FUNNY_MISS_LINES = [
  (name) => `Oopsie, ${name}! My monocle popped off! 🧐 Check the step-by-step clue below!`,
  (name) => `Almost there, ${name}! Even supercomputers drop a packet sometimes! Check how it works below! 🤓💪`,
  (name) => `Don't sweat it, ${name}! Mistakes help our brains level up! Read the proof below! 🌱✨`,
];

export function getEvolutionStage(totalCorrect = 0) {
  if (totalCorrect >= 20) {
    return {
      level: 5,
      title: 'Overclocked Cosmic Legend',
      accessory: '👑',
      aura: true,
      nextAt: null,
      color: '#f43f5e',
    };
  }
  if (totalCorrect >= 12) {
    return {
      level: 4,
      title: 'Royal Quantum Monarch',
      accessory: '🎩',
      aura: true,
      nextAt: 20,
      color: '#f59e0b',
    };
  }
  if (totalCorrect >= 6) {
    return {
      level: 3,
      title: 'Turbo Cyber Skater',
      accessory: '🕶️',
      aura: false,
      nextAt: 12,
      color: '#10b981',
    };
  }
  if (totalCorrect >= 2) {
    return {
      level: 2,
      title: 'Super Scout Companion',
      accessory: '🧢',
      aura: false,
      nextAt: 6,
      color: '#3b82f6',
    };
  }
  return {
    level: 1,
    title: 'Rookie Server Tamagotchi',
    accessory: '🐣',
    aura: false,
    nextAt: 2,
    color: '#8b5cf6',
  };
}

export default function MathTamagotchi({
  feedback, // { status: 'correct' | 'incorrect', answer }
  streak = 0,
  correctCount = 0,
  soundEnabled = true,
  speciesId = 'server-bot',
  studentName = '',
}) {
  const [activeSkit, setActiveSkit] = useState(FUNNY_WIN_SKITS[0]);
  const [speechText, setSpeechText] = useState('');
  const [snackEmoji, setSnackEmoji] = useState(null);
  const [showCrumbs, setShowCrumbs] = useState(false);

  const displayName = studentName.trim() || 'Superstar';
  const currentSpecies = PET_SPECIES.find((p) => p.id === speciesId) || PET_SPECIES[0];
  const stage = getEvolutionStage(correctCount);

  useEffect(() => {
    if (!feedback) {
      setSnackEmoji(null);
      setShowCrumbs(false);
      return;
    }

    if (feedback.status === 'correct') {
      const skit = FUNNY_WIN_SKITS[Math.floor(Math.random() * FUNNY_WIN_SKITS.length)];
      setActiveSkit(skit);
      setSpeechText(skit.line(displayName));
      setSnackEmoji(skit.snack);
      setShowCrumbs(false);

      if (soundEnabled) {
        playTamagotchiChomp();
        setTimeout(() => playTamagotchiDance(), 320);
      }

      const crumbTimer = setTimeout(() => {
        setShowCrumbs(true);
      }, 350);

      return () => clearTimeout(crumbTimer);
    } else {
      const missFn = FUNNY_MISS_LINES[Math.floor(Math.random() * FUNNY_MISS_LINES.length)];
      setSpeechText(missFn(displayName));
      setSnackEmoji(null);
      setShowCrumbs(false);
    }
  }, [feedback, displayName, soundEnabled]);

  // Only render the animated Tamagotchi AFTER the user answers a question!
  if (!feedback) {
    return null;
  }

  const isHappy = feedback.status === 'correct';
  const isComfort = feedback.status === 'incorrect';
  const isDiscoParty = isHappy && (streak >= 2 || activeSkit.dance === 'dance-disco');

  const renderCharacterSvg = () => {
    if (currentSpecies.id === 'server-bot') {
      return (
        <svg viewBox="0 0 140 130" className="tamagotchi-svg" aria-label="Animated Server Tamagotchi Robot">
          <defs>
            <linearGradient id="botMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="botVisor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="botAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          <ellipse cx="70" cy="122" rx="34" ry="6" fill="rgba(0,0,0,0.28)" className="tama-shadow" />

          <g className="tama-thrusters">
            <rect x="46" y="98" width="14" height="8" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <rect x="80" y="98" width="14" height="8" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <path d="M 48 106 Q 53 122 58 106 Z" fill="#38bdf8" className="thruster-flame" />
            <path d="M 82 106 Q 87 122 92 106 Z" fill="#38bdf8" className="thruster-flame" />
            {isHappy && (
              <>
                <path d="M 46 106 Q 53 128 60 106 Z" fill="#f59e0b" className="thruster-flame" />
                <path d="M 80 106 Q 87 128 94 106 Z" fill="#f59e0b" className="thruster-flame" />
              </>
            )}
          </g>

          <g className={`tama-arm-left ${isHappy ? 'arm-party-left' : ''}`}>
            <rect x="12" y="58" width="16" height="26" rx="8" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="20" cy="84" r="5" fill="#38bdf8" />
          </g>
          <g className={`tama-arm-right ${isHappy ? 'arm-party-right' : ''}`}>
            <rect x="112" y="58" width="16" height="26" rx="8" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="120" cy="84" r="5" fill="#38bdf8" />
          </g>

          <rect x="34" y="64" width="72" height="38" rx="16" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="3" />
          <rect x="44" y="71" width="52" height="24" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="54" cy="79" r="3" fill="#10b981" className="server-led led-1" />
          <circle cx="64" cy="79" r="3" fill="#38bdf8" className="server-led led-2" />
          <circle cx="74" cy="79" r="3" fill="#f59e0b" className="server-led led-3" />
          <circle cx="84" cy="79" r="3" fill="#ec4899" className="server-led led-4" />
          <polyline
            points="50,88 58,88 62,83 67,92 72,85 77,88 90,88"
            fill="none"
            stroke={isHappy ? '#10b981' : '#38bdf8'}
            strokeWidth="2"
            strokeLinecap="round"
          />

          <g className="tama-head-rig">
            <line x1="70" y1="8" x2="70" y2="22" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="8" r="6" fill={isHappy ? '#f43f5e' : '#38bdf8'} className="antenna-orb" />

            <rect x="20" y="34" width="10" height="22" rx="5" fill="url(#botAccent)" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="110" y="34" width="10" height="22" rx="5" fill="url(#botAccent)" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="28" y="20" width="84" height="48" rx="22" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="3" />
            <rect x="35" y="26" width="70" height="36" rx="16" fill="url(#botVisor)" stroke="#38bdf8" strokeWidth="2" />

            <ellipse cx="44" cy="51" rx="5" ry="2.5" fill="#fb7185" opacity="0.85" />
            <ellipse cx="96" cy="51" rx="5" ry="2.5" fill="#fb7185" opacity="0.85" />

            {isHappy ? (
              <g stroke="#38bdf8" strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M 45 44 Q 52 34 59 44" />
                <path d="M 81 44 Q 88 34 95 44" />
              </g>
            ) : (
              <g className="tama-eyes-blink">
                <rect x="46" y="35" width="11" height="13" rx="5" fill="#38bdf8" />
                <circle cx="49" cy="39" r="2.2" fill="#ffffff" />
                <rect x="83" y="35" width="11" height="13" rx="5" fill="#38bdf8" />
                <circle cx="86" cy="39" r="2.2" fill="#ffffff" />
              </g>
            )}

            {isComfort && (
              <g stroke="#fbbf24" strokeWidth="2.5" fill="rgba(251, 191, 36, 0.15)">
                <circle cx="52" cy="42" r="10" />
                <circle cx="88" cy="42" r="10" />
                <line x1="62" y1="42" x2="78" y2="42" />
              </g>
            )}

            {isHappy ? (
              <path
                d="M 56 49 Q 70 64 84 49 Z"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="tama-mouth-chomp"
              />
            ) : (
              <circle cx="70" cy="53" r="4" fill="#fbbf24" />
            )}
          </g>
        </svg>
      );
    }

    if (currentSpecies.id === 'sierra-dragon') {
      return (
        <svg viewBox="0 0 140 130" className="tamagotchi-svg" aria-label="Animated Sierra Dragon Pet">
          <ellipse cx="70" cy="120" rx="34" ry="6" fill="rgba(0,0,0,0.25)" />
          <path d="M 38 64 Q 8 40 14 74 Q 26 78 38 76 Z" fill="#f59e0b" stroke="#065f46" strokeWidth="2.5" className="dragon-wing-left" />
          <path d="M 102 64 Q 132 40 126 74 Q 114 78 102 76 Z" fill="#f59e0b" stroke="#065f46" strokeWidth="2.5" className="dragon-wing-right" />
          <path d="M 96 92 Q 124 96 126 78" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          <path d="M 122 76 Q 128 60 134 76 Q 128 82 122 76 Z" fill="#f97316" className="thruster-flame" />

          <ellipse cx="50" cy="111" rx="12" ry="7" fill="#059669" stroke="#064e3b" strokeWidth="2.5" />
          <ellipse cx="90" cy="111" rx="12" ry="7" fill="#059669" stroke="#064e3b" strokeWidth="2.5" />

          <ellipse cx="70" cy="76" rx="36" ry="34" fill="#10b981" stroke="#064e3b" strokeWidth="3" />
          <ellipse cx="70" cy="82" rx="22" ry="21" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
          <line x1="52" y1="76" x2="88" y2="76" stroke="#f59e0b" strokeWidth="2" />
          <line x1="50" y1="84" x2="90" y2="84" stroke="#f59e0b" strokeWidth="2" />
          <line x1="54" y1="92" x2="86" y2="92" stroke="#f59e0b" strokeWidth="2" />

          <g className="tama-head-rig">
            <path d="M 45 28 L 36 12 L 54 24 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" />
            <path d="M 95 28 L 104 12 L 86 24 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" />
            <ellipse cx="70" cy="46" rx="33" ry="26" fill="#10b981" stroke="#064e3b" strokeWidth="3" />
            <ellipse cx="46" cy="52" rx="5.5" ry="3" fill="#fb7185" />
            <ellipse cx="94" cy="52" rx="5.5" ry="3" fill="#fb7185" />

            {isHappy ? (
              <g stroke="#064e3b" strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M 46 44 Q 53 35 60 44" />
                <path d="M 80 44 Q 87 35 94 44" />
              </g>
            ) : (
              <g className="tama-eyes-blink">
                <circle cx="53" cy="42" r="5.5" fill="#064e3b" />
                <circle cx="51" cy="40" r="2" fill="#ffffff" />
                <circle cx="87" cy="42" r="5.5" fill="#064e3b" />
                <circle cx="85" cy="40" r="2" fill="#ffffff" />
              </g>
            )}

            <circle cx="64" cy="48" r="2" fill="#064e3b" />
            <circle cx="76" cy="48" r="2" fill="#064e3b" />
            {isHappy ? (
              <path d="M 56 54 Q 70 70 84 54 Z" fill="#e11d48" stroke="#064e3b" strokeWidth="2" className="tama-mouth-chomp" />
            ) : (
              <circle cx="70" cy="58" r="4.5" fill="#e11d48" />
            )}
          </g>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 140 130" className="tamagotchi-svg" aria-label="Animated Golden Bear Tamagotchi">
        <ellipse cx="70" cy="120" rx="34" ry="6" fill="rgba(0,0,0,0.24)" />
        <ellipse cx="50" cy="111" rx="13" ry="8" fill="#b45309" stroke="#78350f" strokeWidth="2.8" />
        <ellipse cx="90" cy="111" rx="13" ry="8" fill="#b45309" stroke="#78350f" strokeWidth="2.8" />

        <ellipse cx="26" cy="74" rx="12" ry="8" fill="#d97706" stroke="#78350f" strokeWidth="2.8" className={`tama-arm-left ${isHappy ? 'arm-party-left' : ''}`} />
        <ellipse cx="114" cy="74" rx="12" ry="8" fill="#d97706" stroke="#78350f" strokeWidth="2.8" className={`tama-arm-right ${isHappy ? 'arm-party-right' : ''}`} />

        <ellipse cx="70" cy="76" rx="37" ry="34" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
        <ellipse cx="70" cy="82" rx="23" ry="20" fill="#fef3c7" />
        <text x="70" y="88" textAnchor="middle" fontSize="16">⭐</text>

        <g className="tama-head-rig">
          <circle cx="40" cy="24" r="13" fill="#d97706" stroke="#78350f" strokeWidth="3" />
          <circle cx="40" cy="24" r="6.5" fill="#fde68a" />
          <circle cx="100" cy="24" r="13" fill="#d97706" stroke="#78350f" strokeWidth="3" />
          <circle cx="100" cy="24" r="6.5" fill="#fde68a" />

          <ellipse cx="70" cy="46" rx="34" ry="27" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
          <ellipse cx="46" cy="52" rx="6" ry="3.5" fill="#fb7185" opacity="0.85" />
          <ellipse cx="94" cy="52" rx="6" ry="3.5" fill="#fb7185" opacity="0.85" />

          {isHappy ? (
            <g stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round">
              <path d="M 46 43 Q 53 34 60 43" />
              <path d="M 80 43 Q 87 34 94 43" />
            </g>
          ) : (
            <g className="tama-eyes-blink">
              <circle cx="53" cy="42" r="5.5" fill="#1e293b" />
              <circle cx="51" cy="40" r="2" fill="#ffffff" />
              <circle cx="87" cy="42" r="5.5" fill="#1e293b" />
              <circle cx="85" cy="40" r="2" fill="#ffffff" />
            </g>
          )}

          {isComfort && (
            <g stroke="#3b82f6" strokeWidth="2.5" fill="rgba(59, 130, 246, 0.15)">
              <circle cx="53" cy="42" r="10" />
              <circle cx="87" cy="42" r="10" />
              <line x1="63" y1="42" x2="77" y2="42" />
            </g>
          )}

          <ellipse cx="70" cy="48" rx="5.5" ry="3.8" fill="#451a03" />

          {isHappy ? (
            <path d="M 56 54 Q 70 70 84 54 Z" fill="#e11d48" stroke="#78350f" strokeWidth="2.5" className="tama-mouth-chomp" />
          ) : (
            <circle cx="70" cy="58" r="4.5" fill="#e11d48" />
          )}
        </g>
      </svg>
    );
  };

  return (
    <div
      className={`tamagotchi-post-answer-banner ${isHappy ? 'state-celebrating' : 'state-comforting'} ${
        isDiscoParty ? 'disco-mode-active' : ''
      }`}
    >
      {/* Animated Pet Stage */}
      <div
        className="tamagotchi-stage-track"
        onClick={() => soundEnabled && playTamagotchiGiggle()}
        title="Click to hear your pet giggle!"
      >
        {isDiscoParty && (
          <div className="tama-disco-ball" aria-hidden="true">
            🪩
          </div>
        )}

        <span className="tama-bg-cloud cloud-1">☁️</span>
        <span className="tama-bg-cloud cloud-2">{isHappy ? '🎵' : '⭐'}</span>
        <span className="tama-bg-cloud cloud-3">{isHappy ? '🎶' : '☁️'}</span>
        <div className="tama-scenery-hills" aria-hidden="true" />

        {isHappy && <div className="tama-action-banner">{activeSkit.actionTag}</div>}

        {snackEmoji && isHappy && (
          <div className="tama-flying-snack" aria-hidden="true">
            {snackEmoji}
          </div>
        )}

        {showCrumbs && isHappy && (
          <div className="tama-crumb-burst" aria-hidden="true">
            <span className="crumb c1">✨</span>
            <span className="crumb c2">💥</span>
            <span className="crumb c3">⭐</span>
            <span className="crumb c4">+XP!</span>
          </div>
        )}

        {isHappy && (
          <div className="tama-floating-hearts" aria-hidden="true">
            <span>💖</span>
            <span>🎵</span>
            <span>🌟</span>
            <span>🎶</span>
          </div>
        )}

        {isHappy && activeSkit.dance === 'dance-dj' && (
          <div className="tama-dj-deck" aria-hidden="true">
            🎧 💿 🎛️
          </div>
        )}

        <div
          className={`tamagotchi-actor ${isHappy ? activeSkit.dance : 'pose-comfort'} ${
            stage.aura ? 'golden-aura' : ''
          }`}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="tama-head-accessory">{stage.accessory}</div>
          {renderCharacterSvg()}
        </div>
      </div>

      {/* Speech & Evolution Status */}
      <div className="tamagotchi-speech-bubble">
        <div className="speech-header-row">
          <span className="speech-pet-name">
            {currentSpecies.icon} {currentSpecies.name} • {stage.accessory} Lv.{stage.level} {stage.title}
          </span>
          {streak >= 2 && (
            <span className="tamagotchi-combo-pill">🔥 {streak} in a row!</span>
          )}
        </div>
        <div className="speech-text">{speechText}</div>
      </div>
    </div>
  );
}
