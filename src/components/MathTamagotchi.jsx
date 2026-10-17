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
    line: "BEEP-BOOP-BOOGIE! That correct answer just powered up my Disco Core! 🪩🕺",
  },
  {
    dance: 'dance-backflip',
    snack: '🌮',
    actionTag: '🤸‍♂️ DOUBLE BACKFLIP!',
    line: "CRUNCH!! Taco-powered 360° backflip! Your math brain is unstoppable! 🌮🚀",
  },
  {
    dance: 'dance-breakdance',
    snack: '🍩',
    actionTag: '🌀 HEADSPIN MODE!',
    line: "WHOA! That equation was so sweet I'm spinning on my head! 🍩🌀",
  },
  {
    dance: 'dance-moonwalk',
    snack: '🍓',
    actionTag: '👟 SMOOTH MOONWALK!',
    line: "hee-hee! Watch me moonwalk across the server rack for that answer! 🍓✨",
  },
  {
    dance: 'dance-rocket',
    snack: '🍔',
    actionTag: '🚀 TURBO BOOST!',
    line: "NOM NOM! Thrusters at 1000%! Launching to Planet Genius! 🍔🔥",
  },
  {
    dance: 'dance-dj',
    snack: '🍦',
    actionTag: '🎧 DJ DROP!',
    line: "WIKI-WIKI-MATH! Dropping the freshest beats in California! 🎧💿",
  },
];

const FUNNY_IDLE_LINES = [
  "Server status: 99% cute, 1% hungry! Solve this problem to feed me a snack! 🍕👀",
  "My antenna is scanning this math puzzle... I know you can crack it! 📡✨",
  "Psst! Tap my belly to tickle me, or press [🕺 Dance] for a silly move! 🐾😄",
  "Get a 3x Streak and my habitat transforms into a Neon Disco Party! 🪩🔥",
  "Every correct answer upgrades my Server Tamagotchi evolution level! 🚀⭐",
];

const FUNNY_TICKLE_LINES = [
  "BZZT-HEHEHE! Stop tickling my motherboard, I'm gonna short-circuit from laughing! 😂⚡",
  "SQUEAK!! That tickles my tummy sensors! +500 Joy Megabytes! 🤣💖",
  "BOING-BOING! Best math partner ever! Now let's solve this one! 🌟🐾",
];

const FUNNY_PLAY_LINES = [
  "BOING! Header! Look at me juggle this math ball! ⚽🤸‍♂️",
  "ALLEZ-OOP! Bouncing the beach ball while you calculate! 🏐✨",
];

const FUNNY_MISS_LINES = [
  "BZZT-OOPS! My monocle popped off! 🧐 Check the step-by-step clue below!",
  "Almost! Even supercomputers drop a packet sometimes! Let's read how it works! 🤓💪",
  "Don't sweat it! Mistakes are how our brains level up! Check the proof below! 🌱✨",
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
}) {
  const [speciesIdx, setSpeciesIdx] = useState(0); // Default: Byte-Bot the Server Tamagotchi!
  const [petState, setPetState] = useState('idle'); // 'idle' | 'celebrating' | 'comforting' | 'tickled' | 'playing-ball'
  const [activeSkit, setActiveSkit] = useState(FUNNY_WIN_SKITS[0]);
  const [speechText, setSpeechText] = useState(FUNNY_IDLE_LINES[0]);
  const [snackEmoji, setSnackEmoji] = useState(null);
  const [showCrumbs, setShowCrumbs] = useState(false);
  const [fullness, setFullness] = useState(78);
  const [happiness, setHappiness] = useState(88);
  const [energy, setEnergy] = useState(92);
  const [walkDirection, setWalkDirection] = useState(1);
  const [walkPos, setWalkPos] = useState(50);
  const [stepFrame, setStepFrame] = useState(0);

  const currentSpecies = PET_SPECIES[speciesIdx];
  const stage = getEvolutionStage(correctCount);
  const isDiscoParty = streak >= 3 || (petState === 'celebrating' && activeSkit.dance === 'dance-disco');

  // Autonomous smooth walking across the stage with alternating 2-frame leg stride
  useEffect(() => {
    if (petState !== 'idle') return;
    const interval = setInterval(() => {
      setStepFrame((f) => (f + 1) % 2);
      setWalkPos((prev) => {
        let next = prev + walkDirection * 4.5;
        if (next >= 78) {
          setWalkDirection(-1);
          next = 78;
        } else if (next <= 22) {
          setWalkDirection(1);
          next = 22;
        }
        return next;
      });
    }, 320);
    return () => clearInterval(interval);
  }, [petState, walkDirection]);

  // Rotate idle dialogue
  useEffect(() => {
    if (petState !== 'idle') return;
    const thoughtTimer = setInterval(() => {
      const randomLine = FUNNY_IDLE_LINES[Math.floor(Math.random() * FUNNY_IDLE_LINES.length)];
      setSpeechText(randomLine);
    }, 6500);
    return () => clearInterval(thoughtTimer);
  }, [petState]);

  // Trigger multi-stage celebration skit on every correct answer!
  useEffect(() => {
    if (!feedback) {
      setPetState('idle');
      setSnackEmoji(null);
      setShowCrumbs(false);
      return;
    }

    if (feedback.status === 'correct') {
      const skit = FUNNY_WIN_SKITS[Math.floor(Math.random() * FUNNY_WIN_SKITS.length)];
      setActiveSkit(skit);
      setPetState('celebrating');
      setSpeechText(skit.line);
      setSnackEmoji(skit.snack);
      setShowCrumbs(false);
      setFullness((f) => Math.min(100, f + 14));
      setHappiness((h) => Math.min(100, h + 15));
      setEnergy((e) => Math.min(100, e + 10));

      if (soundEnabled) {
        playTamagotchiChomp();
      }

      const crumbTimer = setTimeout(() => {
        setShowCrumbs(true);
      }, 360);

      return () => clearTimeout(crumbTimer);
    } else if (feedback.status === 'incorrect') {
      const missLine = FUNNY_MISS_LINES[Math.floor(Math.random() * FUNNY_MISS_LINES.length)];
      setPetState('comforting');
      setSpeechText(missLine);
      setSnackEmoji(null);
      setShowCrumbs(false);
      setFullness((f) => Math.max(45, f - 4));
    }
  }, [feedback, soundEnabled]);

  const handleTicklePet = () => {
    if (petState === 'celebrating') return;
    if (soundEnabled) playTamagotchiGiggle();
    const line = FUNNY_TICKLE_LINES[Math.floor(Math.random() * FUNNY_TICKLE_LINES.length)];
    setPetState('tickled');
    setSpeechText(line);
    setHappiness((h) => Math.min(100, h + 8));
    setTimeout(() => {
      if (!feedback) setPetState('idle');
    }, 1800);
  };

  const handleManualFeed = (e) => {
    e.stopPropagation();
    if (soundEnabled) playTamagotchiChomp();
    const skit = FUNNY_WIN_SKITS[Math.floor(Math.random() * FUNNY_WIN_SKITS.length)];
    setActiveSkit(skit);
    setSnackEmoji(skit.snack);
    setShowCrumbs(false);
    setPetState('celebrating');
    setSpeechText(`YUM! Thank you for the bonus ${skit.snack} treat! My server tummy is purring! 😋💖`);
    setFullness((f) => Math.min(100, f + 15));
    setTimeout(() => setShowCrumbs(true), 360);
    setTimeout(() => {
      if (!feedback) {
        setPetState('idle');
        setSnackEmoji(null);
        setShowCrumbs(false);
      }
    }, 1850);
  };

  const handleManualDance = (e) => {
    e.stopPropagation();
    if (soundEnabled) playTamagotchiDance();
    const skit = FUNNY_WIN_SKITS[Math.floor(Math.random() * FUNNY_WIN_SKITS.length)];
    setActiveSkit(skit);
    setSnackEmoji(null);
    setPetState('celebrating');
    setSpeechText(skit.line);
    setHappiness((h) => Math.min(100, h + 12));
    setTimeout(() => {
      if (!feedback) setPetState('idle');
    }, 1900);
  };

  const handlePlayBall = (e) => {
    e.stopPropagation();
    if (soundEnabled) playTamagotchiGiggle();
    const line = FUNNY_PLAY_LINES[Math.floor(Math.random() * FUNNY_PLAY_LINES.length)];
    setPetState('playing-ball');
    setSpeechText(line);
    setEnergy((en) => Math.min(100, en + 10));
    setTimeout(() => {
      if (!feedback) setPetState('idle');
    }, 1900);
  };

  const handleSwitchSpecies = (e) => {
    e.stopPropagation();
    if (soundEnabled) playTamagotchiGiggle();
    const nextIdx = (speciesIdx + 1) % PET_SPECIES.length;
    setSpeciesIdx(nextIdx);
    setSpeechText(`TRANSFORMATION COMPLETE! Hi, I'm ${PET_SPECIES[nextIdx].name} ${PET_SPECIES[nextIdx].icon}! Let's solve math!`);
  };

  const renderCharacterSvg = () => {
    const isHappy = petState === 'celebrating' || petState === 'tickled' || petState === 'playing-ball';
    const isComfort = petState === 'comforting';

    if (currentSpecies.id === 'server-bot') {
      // High-Craft Articulated Server-Bot ("Byte-Bot 9000")
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

          {/* Ground Hover Shadow */}
          <ellipse cx="70" cy="122" rx="34" ry="6" fill="rgba(0,0,0,0.28)" className="tama-shadow" />

          {/* Twin Plasma Hover Thrusters & Animated Flame Plumes */}
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

          {/* Articulated Hover-Arms */}
          <g className={`tama-arm-left ${isHappy ? 'arm-party-left' : ''}`}>
            <rect x="12" y="58" width="16" height="26" rx="8" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="20" cy="84" r="5" fill="#38bdf8" />
          </g>
          <g className={`tama-arm-right ${isHappy ? 'arm-party-right' : ''}`}>
            <rect x="112" y="58" width="16" height="26" rx="8" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="120" cy="84" r="5" fill="#38bdf8" />
          </g>

          {/* Main Server Torso Chassis */}
          <rect x="34" y="64" width="72" height="38" rx="16" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="3" />
          {/* Server Rack Belly Panel with Blinking Status LEDs */}
          <rect x="44" y="71" width="52" height="24" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="54" cy="79" r="3" fill="#10b981" className="server-led led-1" />
          <circle cx="64" cy="79" r="3" fill="#38bdf8" className="server-led led-2" />
          <circle cx="74" cy="79" r="3" fill="#f59e0b" className="server-led led-3" />
          <circle cx="84" cy="79" r="3" fill="#ec4899" className="server-led led-4" />
          {/* Heartbeat / CPU Wave on Belly */}
          <polyline
            points="50,88 58,88 62,83 67,92 72,85 77,88 90,88"
            fill="none"
            stroke={isHappy ? '#10b981' : '#38bdf8'}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Articulated Head Module */}
          <g className="tama-head-rig">
            {/* Spinning Radar Antenna */}
            <line x1="70" y1="8" x2="70" y2="22" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="8" r="6" fill={isHappy ? '#f43f5e' : '#38bdf8'} className="antenna-orb" />

            {/* Side Ear Headphones */}
            <rect x="20" y="34" width="10" height="22" rx="5" fill="url(#botAccent)" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="110" y="34" width="10" height="22" rx="5" fill="url(#botAccent)" stroke="#1e293b" strokeWidth="2.5" />

            {/* Outer Helmet Shell */}
            <rect x="28" y="20" width="84" height="48" rx="22" fill="url(#botMetal)" stroke="#1e293b" strokeWidth="3" />

            {/* Glossy OLED Face Visor */}
            <rect x="35" y="26" width="70" height="36" rx="16" fill="url(#botVisor)" stroke="#38bdf8" strokeWidth="2" />

            {/* Digital LED Cheeks */}
            <ellipse cx="44" cy="51" rx="5" ry="2.5" fill="#fb7185" opacity="0.85" />
            <ellipse cx="96" cy="51" rx="5" ry="2.5" fill="#fb7185" opacity="0.85" />

            {/* Expressive LED Matrix Eyes */}
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

            {/* Holographic Nerd Glasses on Mistake */}
            {isComfort && (
              <g stroke="#fbbf24" strokeWidth="2.5" fill="rgba(251, 191, 36, 0.15)">
                <circle cx="52" cy="42" r="10" />
                <circle cx="88" cy="42" r="10" />
                <line x1="62" y1="42" x2="78" y2="42" />
              </g>
            )}

            {/* LED Mouth */}
            {isHappy ? (
              <path
                d="M 56 49 Q 70 64 84 49 Z"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="tama-mouth-chomp"
              />
            ) : isComfort ? (
              <circle cx="70" cy="53" r="4" fill="#fbbf24" />
            ) : (
              <path d="M 60 51 Q 70 58 80 51" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            )}
          </g>
        </svg>
      );
    }

    if (currentSpecies.id === 'sierra-dragon') {
      // Articulated Sierra Math Dragon ("Sparky")
      return (
        <svg viewBox="0 0 140 130" className="tamagotchi-svg" aria-label="Animated Sierra Dragon Pet">
          <ellipse cx="70" cy="120" rx="34" ry="6" fill="rgba(0,0,0,0.25)" />
          {/* Flapping Dragon Wings */}
          <path
            d="M 38 64 Q 8 40 14 74 Q 26 78 38 76 Z"
            fill="#f59e0b"
            stroke="#065f46"
            strokeWidth="2.5"
            className="dragon-wing-left"
          />
          <path
            d="M 102 64 Q 132 40 126 74 Q 114 78 102 76 Z"
            fill="#f59e0b"
            stroke="#065f46"
            strokeWidth="2.5"
            className="dragon-wing-right"
          />
          {/* Wagging Dragon Tail + Flame */}
          <path d="M 96 92 Q 124 96 126 78" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          <path d="M 122 76 Q 128 60 134 76 Q 128 82 122 76 Z" fill="#f97316" className="thruster-flame" />

          {/* Alternating Walking Feet */}
          <ellipse
            cx="50"
            cy={stepFrame === 0 && petState === 'idle' ? '109' : '113'}
            rx="12"
            ry="7"
            fill="#059669"
            stroke="#064e3b"
            strokeWidth="2.5"
          />
          <ellipse
            cx="90"
            cy={stepFrame === 1 && petState === 'idle' ? '109' : '113'}
            rx="12"
            ry="7"
            fill="#059669"
            stroke="#064e3b"
            strokeWidth="2.5"
          />

          {/* Dragon Body & Ribbed Golden Belly */}
          <ellipse cx="70" cy="76" rx="36" ry="34" fill="#10b981" stroke="#064e3b" strokeWidth="3" />
          <ellipse cx="70" cy="82" rx="22" ry="21" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
          <line x1="52" y1="76" x2="88" y2="76" stroke="#f59e0b" strokeWidth="2" />
          <line x1="50" y1="84" x2="90" y2="84" stroke="#f59e0b" strokeWidth="2" />
          <line x1="54" y1="92" x2="86" y2="92" stroke="#f59e0b" strokeWidth="2" />

          {/* Dragon Head & Horns */}
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

            {/* Dragon Snout Nostrils & Mouth */}
            <circle cx="64" cy="48" r="2" fill="#064e3b" />
            <circle cx="76" cy="48" r="2" fill="#064e3b" />
            {isHappy ? (
              <path d="M 56 54 Q 70 70 84 54 Z" fill="#e11d48" stroke="#064e3b" strokeWidth="2" className="tama-mouth-chomp" />
            ) : (
              <path d="M 58 55 Q 70 62 82 55" fill="none" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
            )}
          </g>
        </svg>
      );
    }

    // Articulated California Golden Bear ("Barnaby")
    return (
      <svg viewBox="0 0 140 130" className="tamagotchi-svg" aria-label="Animated Golden Bear Tamagotchi">
        <ellipse cx="70" cy="120" rx="34" ry="6" fill="rgba(0,0,0,0.24)" />

        {/* Alternating Walking Feet */}
        <ellipse
          cx="50"
          cy={stepFrame === 0 && petState === 'idle' ? '108' : '113'}
          rx="13"
          ry="8"
          fill="#b45309"
          stroke="#78350f"
          strokeWidth="2.8"
        />
        <ellipse
          cx="90"
          cy={stepFrame === 1 && petState === 'idle' ? '108' : '113'}
          rx="13"
          ry="8"
          fill="#b45309"
          stroke="#78350f"
          strokeWidth="2.8"
        />

        {/* Waving Bear Arms */}
        <ellipse
          cx="26"
          cy="74"
          rx="12"
          ry="8"
          fill="#d97706"
          stroke="#78350f"
          strokeWidth="2.8"
          className={`tama-arm-left ${isHappy ? 'arm-party-left' : ''}`}
        />
        <ellipse
          cx="114"
          cy="74"
          rx="12"
          ry="8"
          fill="#d97706"
          stroke="#78350f"
          strokeWidth="2.8"
          className={`tama-arm-right ${isHappy ? 'arm-party-right' : ''}`}
        />

        {/* Chubby Bear Torso & Star Belly */}
        <ellipse cx="70" cy="76" rx="37" ry="34" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
        <ellipse cx="70" cy="82" rx="23" ry="20" fill="#fef3c7" />
        <text x="70" y="88" textAnchor="middle" fontSize="16">⭐</text>

        {/* Bear Head & Ears */}
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
          ) : isComfort ? (
            <circle cx="70" cy="58" r="4.5" fill="#e11d48" />
          ) : (
            <path d="M 60 55 Q 70 62 80 55" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>
      </svg>
    );
  };

  return (
    <div
      className={`tamagotchi-habitat state-${petState} ${isDiscoParty ? 'disco-mode-active' : ''}`}
      style={{ '--pet-accent': stage.color }}
    >
      {/* Left Column: Tamagotchi Identity, Evolution & Live Vitals */}
      <div className="tamagotchi-info-col">
        <div className="tamagotchi-title-row">
          <span className="tamagotchi-level-pill">
            {stage.accessory} Lv.{stage.level} {stage.title}
          </span>
          {streak >= 2 && (
            <span className="tamagotchi-combo-pill">🔥 {streak}x Overdrive!</span>
          )}
        </div>

        <div className="tamagotchi-meters">
          <div className="tama-meter" title="Math Snack Fullness">
            <span className="tama-meter-label">🍕 Snack Belly</span>
            <div className="tama-meter-track">
              <div className="tama-meter-fill belly-fill" style={{ width: `${fullness}%` }} />
            </div>
          </div>
          <div className="tama-meter" title="Tamagotchi Happiness">
            <span className="tama-meter-label">💖 Joy Core</span>
            <div className="tama-meter-track">
              <div className="tama-meter-fill happy-fill" style={{ width: `${happiness}%` }} />
            </div>
          </div>
          <div className="tama-meter" title="Dance & Server Energy">
            <span className="tama-meter-label">⚡ Hyper Drive</span>
            <div className="tama-meter-track">
              <div className="tama-meter-fill energy-fill" style={{ width: `${energy}%` }} />
            </div>
          </div>
        </div>

        {/* Interactive Tamagotchi Arcade Mini-Buttons */}
        <div className="tama-arcade-controls">
          <button
            type="button"
            className="tama-arcade-btn"
            onClick={handleManualFeed}
            title="Feed your Tamagotchi a delicious snack!"
          >
            🍕 Feed
          </button>
          <button
            type="button"
            className="tama-arcade-btn"
            onClick={handleManualDance}
            title="Watch your Tamagotchi do a funny dance!"
          >
            🕺 Dance
          </button>
          <button
            type="button"
            className="tama-arcade-btn"
            onClick={handlePlayBall}
            title="Bounce a ball with your Tamagotchi!"
          >
            ⚽ Play
          </button>
          <button
            type="button"
            className="tama-arcade-btn species-btn"
            onClick={handleSwitchSpecies}
            title="Switch Tamagotchi character (Server-Bot / Golden Bear / Dragon)"
          >
            {currentSpecies.icon} {currentSpecies.label}
          </button>
        </div>
      </div>

      {/* Center Column: High-Craft Animated Tamagotchi Stage */}
      <div
        className="tamagotchi-stage-track"
        onClick={handleTicklePet}
        title="Click anywhere on the stage to tickle your Tamagotchi!"
      >
        {/* Disco Ball & Lasers when in Disco Mode or 3+ Streak! */}
        {isDiscoParty && (
          <div className="tama-disco-ball" aria-hidden="true">
            🪩
          </div>
        )}

        {/* Parallax Clouds, Stars & Scenery */}
        <span className="tama-bg-cloud cloud-1">☁️</span>
        <span className="tama-bg-cloud cloud-2">{isDiscoParty ? '🎵' : '⭐'}</span>
        <span className="tama-bg-cloud cloud-3">{isDiscoParty ? '🎶' : '☁️'}</span>
        <div className="tama-scenery-hills" aria-hidden="true" />

        {/* Action Tag Banner during Celebration Skits */}
        {petState === 'celebrating' && (
          <div className="tama-action-banner">{activeSkit.actionTag}</div>
        )}

        {/* Parabolic Flying Snack on Correct Answer / Feed */}
        {snackEmoji && petState === 'celebrating' && (
          <div className="tama-flying-snack" aria-hidden="true">
            {snackEmoji}
          </div>
        )}

        {/* Crunchy Crumb Burst when Snack Reaches Mouth */}
        {showCrumbs && petState === 'celebrating' && (
          <div className="tama-crumb-burst" aria-hidden="true">
            <span className="crumb c1">✨</span>
            <span className="crumb c2">💥</span>
            <span className="crumb c3">⭐</span>
            <span className="crumb c4">+XP!</span>
          </div>
        )}

        {/* Bouncing Soccer / Beach Ball when Playing */}
        {petState === 'playing-ball' && (
          <div className="tama-bouncing-ball" aria-hidden="true">
            ⚽
          </div>
        )}

        {/* Floating Hearts & Musical Notes */}
        {(petState === 'celebrating' || petState === 'tickled') && (
          <div className="tama-floating-hearts" aria-hidden="true">
            <span>💖</span>
            <span>🎵</span>
            <span>🌟</span>
            <span>🎶</span>
          </div>
        )}

        {/* DJ Turntable Prop when doing DJ Dance */}
        {petState === 'celebrating' && activeSkit.dance === 'dance-dj' && (
          <div className="tama-dj-deck" aria-hidden="true">
            🎧 💿 🎛️
          </div>
        )}

        {/* The Articulated Tamagotchi Character */}
        <div
          className={`tamagotchi-actor ${
            petState === 'celebrating'
              ? activeSkit.dance
              : petState === 'tickled'
              ? 'dance-tickle'
              : petState === 'playing-ball'
              ? 'dance-boogie'
              : petState === 'comforting'
              ? 'pose-comfort'
              : 'pose-walk'
          } ${stage.aura ? 'golden-aura' : ''}`}
          style={{
            left: petState === 'idle' ? `${walkPos}%` : '50%',
            transform: `translateX(-50%) scaleX(${petState === 'idle' && walkDirection === -1 ? -1 : 1})`,
          }}
        >
          <div className="tama-head-accessory">{stage.accessory}</div>
          {renderCharacterSvg()}
        </div>
      </div>

      {/* Right Column: Dynamic Comic Speech Bubble */}
      <div className="tamagotchi-speech-bubble" key={speechText}>
        <div className="speech-header-row">
          <span className="speech-pet-name">
            {currentSpecies.icon} {currentSpecies.name}
          </span>
          {stage.nextAt && (
            <span className="speech-evo-countdown">
              ⚡ {Math.max(1, stage.nextAt - correctCount)} to Lv.{stage.level + 1}
            </span>
          )}
        </div>
        <div className="speech-text">{speechText}</div>
        <div className="speech-sub-hint">
          🐾 Tap pet to tickle • Use buttons to Feed, Dance, Play, or Switch Pet!
        </div>
      </div>
    </div>
  );
}
