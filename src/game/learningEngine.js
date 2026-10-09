import { STANDARDS, generateQuestion } from '../data/cambrianCurriculum.js';

export const EMPTY_STANDARD_STATS = {
  attempts: 0,
  correct: 0,
  mistakes: 0,
  correctStreak: 0,
  mastery: 0.0,
  lastSeen: null,
  nextReview: null,
  intervalDays: 0,
};

export const createInitialProfile = (grade = '3', school = 'fammatre') => ({
  grade,
  school,
  playerName: 'Cambrian Scholar',
  totalAttempts: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  standards: {},
  updatedAt: new Date().toISOString(),
});

export function updateLearnerProfile(profile, standardCode, isCorrect, now = Date.now()) {
  const current = profile.standards[standardCode] || { ...EMPTY_STANDARD_STATS };
  const nextCorrectStreak = isCorrect ? current.correctStreak + 1 : 0;
  
  // Spaced repetition intervals: 1 day, 3 days, 7 days, 14 days, 30 days
  const intervals = [1, 3, 7, 14, 30];
  const intervalDays = isCorrect
    ? intervals[Math.min(nextCorrectStreak - 1, intervals.length - 1)]
    : 0;

  // Adaptive mastery score (smooth exponential moving update)
  const mastery = isCorrect
    ? Math.min(1, current.mastery + (1 - current.mastery) * 0.25)
    : Math.max(0, current.mastery * 0.7);

  const reviewDelayMs = isCorrect
    ? intervalDays * 24 * 60 * 60 * 1000
    : 10 * 60 * 1000; // review quickly after 10 mins if mistake

  const nextLearningStreak = isCorrect ? profile.currentStreak + 1 : 0;

  return {
    ...profile,
    standards: {
      ...profile.standards,
      [standardCode]: {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (isCorrect ? 1 : 0),
        mistakes: current.mistakes + (isCorrect ? 0 : 1),
        correctStreak: nextCorrectStreak,
        mastery,
        intervalDays,
        lastSeen: new Date(now).toISOString(),
        nextReview: new Date(now + reviewDelayMs).toISOString(),
        lastResult: isCorrect ? 'correct' : 'incorrect',
      },
    },
    totalAttempts: profile.totalAttempts + 1,
    totalCorrect: profile.totalCorrect + (isCorrect ? 1 : 0),
    currentStreak: nextLearningStreak,
    bestStreak: Math.max(profile.bestStreak, nextLearningStreak),
    updatedAt: new Date(now).toISOString(),
  };
}

export function getDueStandards(profile, grade = null, now = Date.now()) {
  const allCodes = Object.keys(STANDARDS).filter(
    (code) => !grade || STANDARDS[code].grade === grade
  );

  return allCodes.filter((code) => {
    const stats = profile.standards[code] || EMPTY_STANDARD_STATS;
    if (!stats.attempts) return true; // unseen is due
    if (!stats.nextReview) return true;
    return Date.parse(stats.nextReview) <= now;
  });
}

export function getMistakeReviewStandards(profile, grade = null) {
  return Object.entries(profile.standards)
    .filter(([code, stats]) => {
      const matchGrade = !grade || STANDARDS[code]?.grade === grade;
      return matchGrade && stats.mistakes > 0;
    })
    .sort((a, b) => b[1].mistakes - a[1].mistakes)
    .map(([code]) => code);
}

export function selectAdaptiveQuestion(grade, profile, random = Math.random, now = Date.now()) {
  const standardsForGrade = Object.keys(STANDARDS).filter((c) => STANDARDS[c].grade === grade);
  if (!standardsForGrade.length) {
    return generateQuestion(grade, null, random);
  }

  const due = new Set(getDueStandards(profile, grade, now));

  // Compute adaptive selection weights
  const weights = standardsForGrade.map((code) => {
    const stats = profile.standards[code] || EMPTY_STANDARD_STATS;
    const weakness = 1 - stats.mastery;
    const mistakeBoost = Math.min(1.5, stats.mistakes * 0.2);
    const dueBoost = due.has(code) ? 1.5 : 0;
    const unseenBoost = stats.attempts === 0 ? 1.8 : 0;
    return Math.max(0.1, weakness + mistakeBoost + dueBoost + unseenBoost);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let pick = random() * totalWeight;
  let selectedCode = standardsForGrade[0];

  for (let i = 0; i < standardsForGrade.length; i += 1) {
    pick -= weights[i];
    if (pick <= 0) {
      selectedCode = standardsForGrade[i];
      break;
    }
  }

  const standardObj = STANDARDS[selectedCode];
  return generateQuestion(grade, standardObj?.domain, random);
}

export const DIFFICULTY_PRESETS = {
  novice: {
    id: 'novice',
    label: 'Novice',
    lives: 5,
    timerSeconds: 45,
    multiplier: 1.0,
    showHints: true,
    description: 'Gentle pace, generous timer & visual hints',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    lives: 3,
    timerSeconds: 25,
    multiplier: 1.25,
    showHints: true,
    description: 'Standard Cambrian classroom challenge',
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    lives: 2,
    timerSeconds: 15,
    multiplier: 1.6,
    showHints: false,
    description: 'Fast-paced mental math sprint',
  },
  master: {
    id: 'master',
    label: 'Master',
    lives: 1,
    timerSeconds: 10,
    multiplier: 2.0,
    showHints: false,
    description: 'High-stakes district tournament mode',
  },
};

export function calculatePoints(streak = 0, difficulty = 'intermediate') {
  const diff = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.intermediate;
  const basePoints = 100;
  const streakBonus = Math.min(5, Math.floor(streak / 2)) * 25;
  return Math.round((basePoints + streakBonus) * diff.multiplier);
}

export function getProgressSummary(profile, grade = null) {
  const standardsForGrade = Object.keys(STANDARDS).filter(
    (c) => !grade || STANDARDS[c].grade === grade
  );

  let masteredCount = 0;
  let learningCount = 0;
  let unseenCount = 0;
  let totalMasterySum = 0;

  standardsForGrade.forEach((code) => {
    const stats = profile.standards[code];
    if (!stats || stats.attempts === 0) {
      unseenCount += 1;
    } else if (stats.mastery >= 0.8) {
      masteredCount += 1;
      totalMasterySum += stats.mastery;
    } else {
      learningCount += 1;
      totalMasterySum += stats.mastery;
    }
  });

  const totalStandards = standardsForGrade.length || 1;
  const overallMasteryPct = Math.round((totalMasterySum / totalStandards) * 100);
  const accuracyPct = profile.totalAttempts > 0
    ? Math.round((profile.totalCorrect / profile.totalAttempts) * 100)
    : 0;

  return {
    masteredCount,
    learningCount,
    unseenCount,
    totalStandards,
    overallMasteryPct,
    accuracyPct,
    totalAttempts: profile.totalAttempts,
    totalCorrect: profile.totalCorrect,
    bestStreak: profile.bestStreak,
  };
}

export function computeAchievements(profile, modeRecords = {}) {
  const summary = getProgressSummary(profile);
  const allStats = Object.values(profile.standards);

  const achievements = [
    {
      id: 'first-step',
      title: 'First Step',
      desc: 'Solve your first California math problem.',
      icon: '🌱',
      unlocked: summary.totalAttempts >= 1,
    },
    {
      id: 'streak-5',
      title: 'High Five',
      desc: 'Reach a streak of 5 correct answers.',
      icon: '✋',
      unlocked: profile.bestStreak >= 5,
    },
    {
      id: 'streak-10',
      title: 'Math Momentum',
      desc: 'Reach a streak of 10 consecutive correct answers.',
      icon: '⚡',
      unlocked: profile.bestStreak >= 10,
    },
    {
      id: 'comeback-kid',
      title: 'Growth Mindset',
      desc: 'Master a standard after at least 2 mistakes.',
      icon: '🧠',
      unlocked: allStats.some((s) => s.mistakes >= 2 && s.mastery >= 0.8),
    },
    {
      id: 'grade-scholar',
      title: 'Cambrian Scholar',
      desc: 'Master at least 3 distinct grade standards.',
      icon: '🎓',
      unlocked: summary.masteredCount >= 3,
    },
    {
      id: 'speed-demon',
      title: 'Cambrian Park Dash',
      desc: 'Win or achieve 500+ points in Speed Sprint mode.',
      icon: '⏱️',
      unlocked: (modeRecords['speed-sprint']?.bestScore || 0) >= 500,
    },
    {
      id: 'perfect-run',
      title: 'Flawless Run',
      desc: 'Complete a session with 100% accuracy (at least 10 attempts).',
      icon: '🌟',
      unlocked: Object.values(modeRecords).some(
        (r) => r.bestAccuracy >= 100 && r.attempts >= 10
      ),
    },
  ];

  return achievements;
}
