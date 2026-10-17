import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ModeSelector, { GAME_MODES } from './components/ModeSelector.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ClassroomModal from './components/ClassroomModal.jsx';
import CurriculumBrowser from './components/CurriculumBrowser.jsx';
import HelpGuide from './components/HelpGuide.jsx';
import SummaryModal from './components/SummaryModal.jsx';
import KnowledgeVaultModal from './components/KnowledgeVaultModal.jsx';
import AchievementsModal from './components/AchievementsModal.jsx';
import { STANDARDS } from './data/californiaCurriculum.js';
import {
  createInitialProfile,
  updateLearnerProfile,
  getDueStandards,
  getMistakeReviewStandards,
  calculatePoints,
  DIFFICULTY_PRESETS,
} from './game/learningEngine.js';
import {
  createClassSession,
  recordClassroomAttempt,
} from './game/classroomSession.js';
import { fetchEducationalQuestion } from './game/api/curriculumFeed.js';
import {
  playCorrectSound,
  playIncorrectSound,
  playVictorySound,
  playStreakChime,
  startFocusMusic,
  stopFocusMusic,
} from './audio.js';

const STORAGE_KEYS = {
  PROFILE: 'california_math_profile_v3',
  THEME: 'california_math_theme_v3',
  SOUND: 'california_math_sound_v3',
  MUSIC: 'california_math_music_v3',
  SESSION: 'california_math_session_v3',
  RECORDS: 'california_math_records_v3',
};

function isAnswerEquivalent(given, correct) {
  const gNorm = String(given ?? '').trim().toLowerCase();
  const cNorm = String(correct ?? '').trim().toLowerCase();
  if (gNorm === cNorm) return true;

  // Allow free-response numeric entry when correct answer has units or commas (e.g., "24" for "24 sq m" or "3000" for "3,000")
  const stripCommas = (s) => s.replace(/,/g, '');
  if (stripCommas(gNorm) === stripCommas(cNorm)) return true;

  const numericOnlyC = stripCommas(cNorm).replace(/^(\$)|(\s*(sq\s*\w+|cu\s*\w+|ft|m|cm|km|g|kg|ml|l|min|¢|°))$/gi, '').trim();
  const numericOnlyG = stripCommas(gNorm).replace(/^(\$)|(\s*(sq\s*\w+|cu\s*\w+|ft|m|cm|km|g|kg|ml|l|min|¢|°))$/gi, '').trim();
  if (numericOnlyG && numericOnlyG === numericOnlyC) return true;

  return false;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MUSIC);
    return saved !== null ? saved === 'true' : false;
  });

  const [grade, setGrade] = useState('3');
  const [focusedStandard, setFocusedStandard] = useState(null);
  const [leagueId, setLeagueId] = useState('golden-bears');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [mode, setMode] = useState('grade-quest');
  const [timedPractice, setTimedPractice] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [engineSource, setEngineSource] = useState('local-verified-engine');
  const [isNetworkOnline, setIsNetworkOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const diffInfo = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.intermediate;
  const [lives, setLives] = useState(diffInfo.lives);
  const [feedback, setFeedback] = useState(null);
  const [roundStats, setRoundStats] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(diffInfo.timerSeconds);
  const timerRef = useRef(null);

  const [classroomOpen, setClassroomOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  const [learnerProfile, setLearnerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : createInitialProfile('3', 'golden-bears');
    } catch {
      return createInitialProfile('3', 'golden-bears');
    }
  });

  const [modeRecords, setModeRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [classSession, setClassSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(learnerProfile));
  }, [learnerProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(modeRecords));
  }, [modeRecords]);

  useEffect(() => {
    if (classSession) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(classSession));
    }
  }, [classSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUSIC, String(musicEnabled));
    if (musicEnabled) {
      startFocusMusic(0.2);
    } else {
      stopFocusMusic();
    }
  }, [musicEnabled]);

  const nextQuestion = useCallback(
    async (customStandard = null, resetSprintClock = false) => {
      setFeedback(null);
      let targetStandard = customStandard || focusedStandard;

      if (!targetStandard) {
        if (mode === 'mistake-review') {
          const mistakes = getMistakeReviewStandards(learnerProfile, grade);
          if (mistakes.length) {
            targetStandard = mistakes[Math.floor(Math.random() * mistakes.length)];
          }
        } else if (mode === 'smart-review') {
          const due = getDueStandards(learnerProfile, grade);
          if (due.length) {
            targetStandard = due[Math.floor(Math.random() * due.length)];
          }
        }
      }

      const activeGrade = targetStandard && STANDARDS[targetStandard] ? STANDARDS[targetStandard].grade : grade;

      const res = await fetchEducationalQuestion({
        grade: activeGrade,
        standardCode: targetStandard,
        mode,
        preferOnline: false,
      });

      setCurrentQuestion(res.question);
      setEngineSource(res.source);

      if (mode === 'speed-sprint') {
        if (resetSprintClock) {
          setTimeLeft(60);
        }
      } else {
        setTimeLeft(diffInfo.timerSeconds || 25);
      }
    },
    [grade, focusedStandard, mode, diffInfo, learnerProfile]
  );

  useEffect(() => {
    if (mode === 'speed-sprint') {
      setTimeLeft(60);
    }
    nextQuestion(focusedStandard, mode === 'speed-sprint');
  }, [grade, focusedStandard, mode, difficulty]);

  const isTimerActive = mode === 'speed-sprint' || timedPractice;

  useEffect(() => {
    if (feedback || summaryOpen || !currentQuestion || !isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (mode === 'speed-sprint') {
            if (soundEnabled) playVictorySound();
            setSummaryOpen(true);
          } else {
            handleTimeOut();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, feedback, summaryOpen, mode, soundEnabled, isTimerActive]);

  const handleTimeOut = () => {
    handleAnswer('TIMEOUT_EXPIRED');
  };

  const handleAnswer = (givenAnswer) => {
    if (feedback || !currentQuestion) return;

    const isCorrect = isAnswerEquivalent(givenAnswer, currentQuestion.correctAnswer);

    const responseTime = Math.max(1, (diffInfo.timerSeconds || 25) - timeLeft);
    const pointsEarned = isCorrect ? calculatePoints(streak, difficulty) : 0;

    if (soundEnabled) {
      if (isCorrect) {
        if (streak > 0 && streak % 3 === 0) {
          playStreakChime(streak + 1);
        } else {
          playCorrectSound();
        }
      } else {
        playIncorrectSound();
      }
    }

    setFeedback({
      status: isCorrect ? 'correct' : 'incorrect',
      answer: givenAnswer,
    });

    const isGameOver = mode !== 'speed-sprint' && !isCorrect && lives <= 1;

    if (isCorrect) {
      setScore((s) => {
        const nextScore = s + pointsEarned;
        setModeRecords((prev) => {
          const prevBest = prev[mode]?.bestScore || 0;
          return {
            ...prev,
            [mode]: { bestScore: Math.max(prevBest, nextScore) },
          };
        });
        return nextScore;
      });
      setStreak((st) => st + 1);
      setRoundStats((rs) => ({ correct: rs.correct + 1, total: rs.total + 1 }));
    } else {
      setStreak(0);
      if (mode !== 'speed-sprint') {
        setLives((l) => Math.max(0, l - 1));
      }
      setRoundStats((rs) => ({ ...rs, total: rs.total + 1 }));
    }

    setLearnerProfile((prev) =>
      updateLearnerProfile(prev, currentQuestion.standard, isCorrect)
    );

    if (classSession) {
      setClassSession((prev) =>
        recordClassroomAttempt(prev, {
          studentName: prev.activeStudent,
          grade,
          standard: currentQuestion.standard,
          prompt: currentQuestion.prompt,
          studentAnswer: givenAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect,
          responseTimeSec: responseTime,
          points: pointsEarned,
        })
      );
    }

    if (isGameOver) {
      setTimeout(() => {
        if (soundEnabled) playVictorySound();
        setSummaryOpen(true);
      }, 1400);
    } else if (isCorrect || mode === 'speed-sprint') {
      setTimeout(() => {
        nextQuestion(focusedStandard, false);
      }, mode === 'speed-sprint' ? 600 : 1150);
    }
    // Note: On incorrect answers in normal learning modes, we pause so the child can read/listen to the step-by-step explanation and click "Got It! Next Question ➔"
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (feedback || !currentQuestion?.options || summaryOpen) return;
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        if (currentQuestion.options[idx] !== undefined) {
          handleAnswer(currentQuestion.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, feedback, summaryOpen]);

  const handleStartClassSession = ({ leaderName, groupName, leagueId }) => {
    const newSession = createClassSession({
      leaderName,
      groupName,
      leagueId,
    });
    setClassSession(newSession);
  };

  const handleUpdateActiveStudent = (name) => {
    if (classSession) {
      setClassSession((prev) => ({ ...prev, activeStudent: name }));
    }
  };

  const handleRestart = () => {
    setLives(diffInfo.lives);
    setScore(0);
    setStreak(0);
    setRoundStats({ correct: 0, total: 0 });
    setSummaryOpen(false);
    nextQuestion(focusedStandard, mode === 'speed-sprint');
  };

  const mistakeStandards = getMistakeReviewStandards(learnerProfile, grade);

  return (
    <div className="app-container">
      <Header
        grade={grade}
        onGradeChange={(g) => {
          setGrade(g);
          setFocusedStandard(null);
        }}
        leagueId={leagueId}
        onLeagueChange={setLeagueId}
        difficulty={difficulty}
        onDifficultyChange={(d) => {
          setDifficulty(d);
          setLives(DIFFICULTY_PRESETS[d]?.lives || 3);
        }}
        score={score}
        streak={streak}
        lives={lives}
        maxLives={diffInfo.lives}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        musicEnabled={musicEnabled}
        onToggleMusic={() => setMusicEnabled((v) => !v)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        timedPractice={timedPractice}
        onToggleTimedPractice={() => setTimedPractice((v) => !v)}
        onOpenClassroom={() => setClassroomOpen(true)}
        onOpenCurriculum={() => setCurriculumOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenVault={() => setVaultOpen(true)}
        onOpenAchievements={() => setAchievementsOpen(true)}
        activeClassSession={classSession}
      />

      <ModeSelector
        currentMode={mode}
        onSelectMode={(m) => {
          setMode(m);
        }}
        mistakeCount={mistakeStandards.length}
      />

      {focusedStandard && (
        <div className="focused-standard-banner">
          <span>
            🎯 Practicing Standard <strong>{focusedStandard}</strong> ({STANDARDS[focusedStandard]?.title})
          </span>
          <button
            type="button"
            className="clear-focus-btn"
            onClick={() => setFocusedStandard(null)}
          >
            × Show All Grade {grade} Topics
          </button>
        </div>
      )}

      <main className="main-game-layout">
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          onSkip={() => nextQuestion(focusedStandard, false)}
          onNextAfterIncorrect={() => nextQuestion(focusedStandard, false)}
          timeLeft={timeLeft}
          totalTime={isTimerActive ? (mode === 'speed-sprint' ? 60 : diffInfo.timerSeconds) : 0}
          feedback={feedback}
          showHints={diffInfo.showHints}
          streak={streak}
          correctCount={roundStats.correct}
        />
      </main>

      <footer className="app-footer">
        <p>
          <strong>California Elementary Math Quest</strong> • Official California Common Core State Standards (CA CCSS-M) & CAASPP Claims 1–4
        </p>
        <p>
          Formally Verified Mathematical Constraint Engine (Grades K–5 • 40 Eureka Math Modules • 82 Official Standards)
        </p>
      </footer>

      <ClassroomModal
        isOpen={classroomOpen}
        onClose={() => setClassroomOpen(false)}
        session={classSession}
        onStartSession={handleStartClassSession}
        onUpdateActiveStudent={handleUpdateActiveStudent}
      />

      <CurriculumBrowser
        isOpen={curriculumOpen}
        onClose={() => setCurriculumOpen(false)}
        learnerProfile={learnerProfile}
        onPracticeStandard={(code) => {
          if (STANDARDS[code]) {
            setGrade(STANDARDS[code].grade);
          }
          setFocusedStandard(code);
          nextQuestion(code, false);
        }}
      />

      <AchievementsModal
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        learnerProfile={learnerProfile}
        currentGrade={grade}
        modeRecords={modeRecords}
      />

      <HelpGuide isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <KnowledgeVaultModal
        isOpen={vaultOpen}
        onClose={() => setVaultOpen(false)}
      />

      <SummaryModal
        isOpen={summaryOpen}
        onClose={() => {
          setSummaryOpen(false);
          handleRestart();
        }}
        score={score}
        streak={streak}
        correctCount={roundStats.correct}
        totalAnswered={roundStats.total}
        onPlayAgain={handleRestart}
        onReviewMistakes={() => {
          setMode('mistake-review');
          setSummaryOpen(false);
          handleRestart();
        }}
        hasMistakes={roundStats.total > roundStats.correct}
        modeTitle={GAME_MODES.find((m) => m.id === mode)?.title}
      />
    </div>
  );
}
