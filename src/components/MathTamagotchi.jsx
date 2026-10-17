import React, { useState, useEffect } from 'react';

const FUNNY_WIN_LINES = [
  "YUM!! That correct answer tasted like golden waffles! 🧇🕺",
  "BOOYAH! Watch me do the California Boogie Dance! 💃✨",
  "NOM NOM NOM! My brain just grew two sizes bigger! 🧠🚀",
  "WOOHOO! Backflip time!! You are a total Math Wizard! 🤸‍♂️⭐",
  "CHOMP! Delicious math snack! Feed me another one! 🍪😋",
  " BEEP BOOP! My Tamagotchi belly is 100% happy! 🎉🐾",
  "SUPER COMBO! Look at my little paws go! 🐾🔥",
  "OH YEAH! Even the Golden Gate Bridge is cheering for you! 🌉🥳",
];

const FUNNY_IDLE_LINES = [
  "Psst... my tummy is rumbling for a Correct Answer Snack! 🍪👀",
  "I'm pacing back and forth thinking about this math puzzle! 🤔🐾",
  "Click me if you want to tickle my belly! Hehehe! 🐾😊",
  "Get 1 more right and watch me do a silly dance! 🕺✨",
  "You've got this! Count carefully and feed me a star! ⭐😋",
];

const FUNNY_TICKLE_LINES = [
  "HEHEHE! Stop! My Tamagotchi belly is super ticklish! 😂🐾",
  "SQUEAK! That tickles! Now let's crush this math problem! 🤣⭐",
  "BOING! You petted me! +100 Friendship Power! 💖🐻",
];

const FUNNY_MISS_LINES = [
  "Oopsie-daisy! Put on your math glasses 🤓 and check the steps below!",
  "Aww, dropped my snack! 🍪 Don't worry, we learn from mistakes! 💪",
  "Almost had it! Read the step-by-step clue and we'll get the next one! 🌟",
];

const SNACK_ICONS = ['🍓', '🍪', '🍯', '🧇', '🍕', '🌮', '🍎', '🧁'];
const DANCE_STYLES = ['dance-backflip', 'dance-boogie', 'dance-disco', 'dance-rocket'];

export function getEvolutionStage(totalCorrect = 0) {
  if (totalCorrect >= 20) {
    return {
      level: 5,
      title: 'Cosmic Jetpack Legend',
      accessory: '🚀',
      nextAt: null,
      color: '#f43f5e',
    };
  }
  if (totalCorrect >= 12) {
    return {
      level: 4,
      title: 'Royal Math Monarch',
      accessory: '👑',
      nextAt: 20,
      color: '#f59e0b',
    };
  }
  if (totalCorrect >= 6) {
    return {
      level: 3,
      title: 'Cool Shades Skater',
      accessory: '🕶️',
      nextAt: 12,
      color: '#10b981',
    };
  }
  if (totalCorrect >= 2) {
    return {
      level: 2,
      title: 'Happy Scout Buddy',
      accessory: '🧢',
      nextAt: 6,
      color: '#3b82f6',
    };
  }
  return {
    level: 1,
    title: 'Baby Tamagotchi Cub',
    accessory: '🐣',
    nextAt: 2,
    color: '#8b5cf6',
  };
}

export default function MathTamagotchi({
  feedback, // { status: 'correct' | 'incorrect', answer }
  streak = 0,
  correctCount = 0,
  grade = '3',
}) {
  const [petState, setPetState] = useState('idle'); // 'idle' | 'celebrating' | 'comforting' | 'tickled'
  const [danceClass, setDanceClass] = useState('dance-boogie');
  const [speechText, setSpeechText] = useState(FUNNY_IDLE_LINES[0]);
  const [snackEmoji, setSnackEmoji] = useState(null);
  const [fullness, setFullness] = useState(75);
  const [happiness, setHappiness] = useState(85);
  const [walkDirection, setWalkDirection] = useState(1);
  const [walkPos, setWalkPos] = useState(50); // 15% to 85% across the mini stage

  const stage = getEvolutionStage(correctCount);

  // Autonomous walking / pacing animation across the habitat when idle
  useEffect(() => {
    if (petState !== 'idle') return;
    const interval = setInterval(() => {
      setWalkPos((prev) => {
        let next = prev + walkDirection * 6;
        if (next >= 78) {
          setWalkDirection(-1);
          next = 78;
        } else if (next <= 22) {
          setWalkDirection(1);
          next = 22;
        }
        return next;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [petState, walkDirection]);

  // Rotate funny idle thoughts occasionally
  useEffect(() => {
    if (petState !== 'idle') return;
    const thoughtTimer = setInterval(() => {
      const randomLine = FUNNY_IDLE_LINES[Math.floor(Math.random() * FUNNY_IDLE_LINES.length)];
      setSpeechText(randomLine);
    }, 7000);
    return () => clearInterval(thoughtTimer);
  }, [petState]);

  // React to question answer feedback!
  useEffect(() => {
    if (!feedback) {
      setPetState('idle');
      setSnackEmoji(null);
      return;
    }

    if (feedback.status === 'correct') {
      const chosenDance = DANCE_STYLES[Math.floor(Math.random() * DANCE_STYLES.length)];
      const chosenLine = FUNNY_WIN_LINES[Math.floor(Math.random() * FUNNY_WIN_LINES.length)];
      const chosenSnack = SNACK_ICONS[Math.floor(Math.random() * SNACK_ICONS.length)];

      setDanceClass(chosenDance);
      setPetState('celebrating');
      setSpeechText(chosenLine);
      setSnackEmoji(chosenSnack);
      setFullness((f) => Math.min(100, f + 12));
      setHappiness((h) => Math.min(100, h + 15));
    } else if (feedback.status === 'incorrect') {
      const chosenMiss = FUNNY_MISS_LINES[Math.floor(Math.random() * FUNNY_MISS_LINES.length)];
      setPetState('comforting');
      setSpeechText(chosenMiss);
      setSnackEmoji(null);
      setFullness((f) => Math.max(40, f - 5));
    }
  }, [feedback]);

  const handleTicklePet = () => {
    if (petState === 'celebrating') return;
    const line = FUNNY_TICKLE_LINES[Math.floor(Math.random() * FUNNY_TICKLE_LINES.length)];
    setPetState('tickled');
    setSpeechText(line);
    setHappiness((h) => Math.min(100, h + 5));
    setTimeout(() => {
      if (!feedback) setPetState('idle');
    }, 1800);
  };

  return (
    <div className={`tamagotchi-habitat state-${petState}`} style={{ '--pet-accent': stage.color }}>
      {/* Left: Tamagotchi Mini Stats & Evolution Badge */}
      <div className="tamagotchi-info-col">
        <div className="tamagotchi-title-row">
          <span className="tamagotchi-level-pill">
            {stage.accessory} Lv.{stage.level} {stage.title}
          </span>
          {streak >= 2 && (
            <span className="tamagotchi-combo-pill">🔥 {streak}x Super Mode!</span>
          )}
        </div>

        <div className="tamagotchi-meters">
          <div className="tama-meter" title="Math Snack Fullness">
            <span className="tama-meter-label">🍪 Snack Belly</span>
            <div className="tama-meter-track">
              <div className="tama-meter-fill belly-fill" style={{ width: `${fullness}%` }} />
            </div>
          </div>
          <div className="tama-meter" title="Pet Happiness">
            <span className="tama-meter-label">💖 Happy Meter</span>
            <div className="tama-meter-track">
              <div className="tama-meter-fill happy-fill" style={{ width: `${happiness}%` }} />
            </div>
          </div>
        </div>

        {stage.nextAt && (
          <div className="tamagotchi-evo-hint">
            ✨ Solve <strong>{Math.max(1, stage.nextAt - correctCount)}</strong> more to evolve your pet!
          </div>
        )}
      </div>

      {/* Center: Interactive Animated Moving Pet Stage */}
      <div
        className="tamagotchi-stage-track"
        onClick={handleTicklePet}
        title="Click to tickle & pet your Math Tamagotchi!"
      >
        {/* Floating Clouds & Stars inside the Tamagotchi Screen */}
        <span className="tama-bg-cloud cloud-1">☁️</span>
        <span className="tama-bg-cloud cloud-2">⭐</span>
        <span className="tama-bg-cloud cloud-3">☁️</span>

        {/* Flying Snack Animation on Correct Answer */}
        {snackEmoji && petState === 'celebrating' && (
          <div className="tama-flying-snack" aria-hidden="true">
            {snackEmoji}
          </div>
        )}

        {/* Floating Hearts when Celebrating or Tickled */}
        {(petState === 'celebrating' || petState === 'tickled') && (
          <div className="tama-floating-hearts" aria-hidden="true">
            <span>💖</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
        )}

        {/* The Animated SVG Tamagotchi Character */}
        <div
          className={`tamagotchi-actor ${
            petState === 'celebrating'
              ? danceClass
              : petState === 'tickled'
              ? 'dance-tickle'
              : petState === 'comforting'
              ? 'pose-comfort'
              : 'pose-walk'
          }`}
          style={{
            left: petState === 'idle' ? `${walkPos}%` : '50%',
            transform: `translateX(-50%) scaleX(${petState === 'idle' && walkDirection === -1 ? -1 : 1})`,
          }}
        >
          {/* Evolution Hat / Crown / Jetpack Accessory */}
          <div className="tama-head-accessory">{stage.accessory}</div>

          <svg
            viewBox="0 0 120 110"
            className="tamagotchi-svg"
            aria-label="Animated Math Tamagotchi Pet"
          >
            {/* Shadow on ground */}
            <ellipse cx="60" cy="102" rx="32" ry="6" fill="rgba(0,0,0,0.22)" className="tama-shadow" />

            {/* Cute Wiggling Ears */}
            <g className="tama-ears">
              <circle cx="30" cy="26" r="14" fill="#d97706" stroke="#78350f" strokeWidth="3" />
              <circle cx="30" cy="26" r="7" fill="#fde68a" />
              <circle cx="90" cy="26" r="14" fill="#d97706" stroke="#78350f" strokeWidth="3" />
              <circle cx="90" cy="26" r="7" fill="#fde68a" />
            </g>

            {/* Little Bouncing Feet */}
            <ellipse cx="42" cy="94" rx="12" ry="8" fill="#b45309" stroke="#78350f" strokeWidth="3" className="tama-foot-left" />
            <ellipse cx="78" cy="94" rx="12" ry="8" fill="#b45309" stroke="#78350f" strokeWidth="3" className="tama-foot-right" />

            {/* Chubby Round Tamagotchi Body */}
            <ellipse cx="60" cy="60" rx="38" ry="35" fill="#f59e0b" stroke="#78350f" strokeWidth="3.5" />

            {/* Soft Cream Belly Patch */}
            <ellipse cx="60" cy="68" rx="23" ry="20" fill="#fef3c7" />

            {/* Waving Arms / Paws */}
            <ellipse
              cx="18"
              cy="60"
              rx="10"
              ry="7"
              fill="#d97706"
              stroke="#78350f"
              strokeWidth="3"
              className="tama-arm-left"
            />
            <ellipse
              cx="102"
              cy="60"
              rx="10"
              ry="7"
              fill="#d97706"
              stroke="#78350f"
              strokeWidth="3"
              className="tama-arm-right"
            />

            {/* Rosy Cheeks */}
            <ellipse cx="36" cy="56" rx="6" ry="3.5" fill="#fb7185" opacity="0.8" />
            <ellipse cx="84" cy="56" rx="6" ry="3.5" fill="#fb7185" opacity="0.8" />

            {/* Expressive Eyes (Happy Arcs when celebrating/tickled, Blinking Pupils otherwise) */}
            {petState === 'celebrating' || petState === 'tickled' ? (
              <g stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M 38 46 Q 44 38 50 46" />
                <path d="M 70 46 Q 76 38 82 46" />
              </g>
            ) : (
              <g className="tama-eyes-blink">
                <circle cx="44" cy="45" r="5.5" fill="#1e293b" />
                <circle cx="42" cy="43" r="2" fill="#ffffff" />
                <circle cx="76" cy="45" r="5.5" fill="#1e293b" />
                <circle cx="74" cy="43" r="2" fill="#ffffff" />
              </g>
            )}

            {/* Cute Glasses when Comforting / Explaining */}
            {petState === 'comforting' && (
              <g stroke="#3b82f6" strokeWidth="2.5" fill="rgba(59, 130, 246, 0.15)">
                <circle cx="44" cy="45" r="9" />
                <circle cx="76" cy="45" r="9" />
                <line x1="53" y1="45" x2="67" y2="45" />
              </g>
            )}

            {/* Cute Nose */}
            <ellipse cx="60" cy="51" rx="5" ry="3.5" fill="#451a03" />

            {/* Mouth (Big Open Happy Chomp when Celebrating, Surprised O when comforting, Cute Smile when Idle) */}
            {petState === 'celebrating' || petState === 'tickled' ? (
              <path
                d="M 48 57 Q 60 72 72 57 Z"
                fill="#e11d48"
                stroke="#78350f"
                strokeWidth="2.5"
                className="tama-mouth-chomp"
              />
            ) : petState === 'comforting' ? (
              <circle cx="60" cy="61" r="4.5" fill="#e11d48" stroke="#78350f" strokeWidth="2" />
            ) : (
              <path
                d="M 52 57 Q 60 64 68 57"
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Right: Funny Speech Bubble */}
      <div className="tamagotchi-speech-bubble" key={speechText}>
        <div className="speech-text">{speechText}</div>
        <div className="speech-sub-hint">🐾 Tap pet to tickle!</div>
      </div>
    </div>
  );
}
