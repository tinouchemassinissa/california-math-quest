let audioCtx = null;
let focusSynthTimer = null;
let focusSynthGain = null;
let focusSynthStep = 0;
let currentFocusVolume = 0.25;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const softTone = (frequency, when, duration, volume, destination, type = 'sine') => {
  const ctx = initAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, when);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, when);
  filter.Q.setValueAtTime(0.5, when);

  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination || ctx.destination);

  osc.start(when);
  osc.stop(when + duration + 0.05);
};

export const playCorrectSound = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ascending bright chime: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      softTone(freq, now + idx * 0.07, 0.26, 0.14, ctx.destination, 'sine');
    });
  } catch (err) {
    console.warn('Audio feedback failed', err);
  }
};

export const playStreakChime = (streak = 1) => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 523.25 * Math.min(1.6, 1 + (streak * 0.05));
    softTone(baseFreq, now, 0.2, 0.12, ctx.destination, 'triangle');
    softTone(baseFreq * 1.25, now + 0.06, 0.28, 0.15, ctx.destination, 'sine');
  } catch (err) {
    console.warn('Audio feedback failed', err);
  }
};

export const playIncorrectSound = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Audio feedback failed', err);
  }
};

export const playVictorySound = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Festive arpeggio fanfare
    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.35 },
      { f: 880.0, d: 0.12 },
      { f: 1046.5, d: 0.6 },
    ];
    let offset = 0;
    notes.forEach((note) => {
      softTone(note.f, now + offset, note.d, 0.18, ctx.destination, 'triangle');
      offset += note.d * 0.85;
    });
  } catch (err) {
    console.warn('Audio feedback failed', err);
  }
};

export const playClickSound = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    softTone(800, now, 0.04, 0.04, ctx.destination, 'sine');
  } catch (err) {
    // ignore
  }
};

// Calming baroque / classical inspired modal chord progression for focus
const FOCUS_CHORDS = [
  [261.63, 329.63, 392.0, 523.25], // C major
  [220.0, 261.63, 329.63, 440.0],  // A minor
  [174.61, 220.0, 261.63, 349.23], // F major
  [196.0, 246.94, 293.66, 392.0],  // G major
];

const FOCUS_PATTERN = [0, 2, 1, 3, 2, 1, 0, 1];
const FOCUS_STEP_MS = 480;

const scheduleFocusStep = () => {
  if (!focusSynthGain) return;
  const ctx = initAudio();
  if (!ctx) return;

  const chordIndex = Math.floor(focusSynthStep / FOCUS_PATTERN.length) % FOCUS_CHORDS.length;
  const noteIndex = FOCUS_PATTERN[focusSynthStep % FOCUS_PATTERN.length];
  const frequency = FOCUS_CHORDS[chordIndex][noteIndex];
  const now = ctx.currentTime;

  softTone(frequency, now, 1.2, 0.08 * currentFocusVolume, focusSynthGain, 'sine');
  softTone(frequency * 0.5, now, 1.8, 0.05 * currentFocusVolume, focusSynthGain, 'triangle');

  focusSynthStep += 1;
};

export const startFocusMusic = (volume = 0.25) => {
  if (focusSynthTimer) return;
  currentFocusVolume = Math.max(0, Math.min(1, volume));
  try {
    const ctx = initAudio();
    if (!ctx) return;
    focusSynthGain = ctx.createGain();
    focusSynthGain.gain.setValueAtTime(currentFocusVolume, ctx.currentTime);
    focusSynthGain.connect(ctx.destination);
    focusSynthStep = 0;
    scheduleFocusStep();
    focusSynthTimer = window.setInterval(scheduleFocusStep, FOCUS_STEP_MS);
  } catch (err) {
    console.warn('Unable to start focus ambient audio', err);
  }
};

export const stopFocusMusic = () => {
  if (focusSynthTimer) {
    window.clearInterval(focusSynthTimer);
    focusSynthTimer = null;
  }
  if (focusSynthGain) {
    try {
      focusSynthGain.disconnect();
    } catch {
      // ignore
    }
    focusSynthGain = null;
  }
};

export const setFocusMusicVolume = (volume) => {
  currentFocusVolume = Math.max(0, Math.min(1, Number(volume) || 0));
  if (focusSynthGain && audioCtx) {
    focusSynthGain.gain.setValueAtTime(currentFocusVolume, audioCtx.currentTime);
  }
};
