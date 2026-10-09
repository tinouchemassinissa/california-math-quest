import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ModeSelector, { GAME_MODES } from './components/ModeSelector.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ClassroomModal from './components/ClassroomModal.jsx';
import CurriculumBrowser from './components/CurriculumBrowser.jsx';
import HelpGuide from './components/HelpGuide.jsx';
import SummaryModal from './components/SummaryModal.jsx';
import KnowledgeVaultModal from './components/KnowledgeVaultModal.jsx';
import {
  STANDARDS,
  PROGRAM_INFO,
} from './data/californiaCurriculum.js';
import {
  createInitialProfile,
  updateLearnerProfile,
  getMistakeReviewStandards,
  selectAdaptiveQuestion,
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
};

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
  const [leagueId, setLeagueId] = useState('golden-bears');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [mode, setMode] = useState('grade-quest');

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

  const [learnerProfile, setLearnerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : createInitialProfile('3', 'golden-bears');
    } catch {
      return createInitialProfile('3', 'golden-bears');
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
    async (customStandard = null) => {
      setFeedback(null);
      let targetStandard = customStandard;

      if (!targetStandard) {
        if (mode === 'mistake-review') {
          const mistakes = getMistakeReviewStandards(learnerProfile, grade);
          if (mistakes.length) {
            targetStandard = mistakes[Math.floor(Math.random() * mistakes.length)];
          }
        }
      }

      const res = await fetchEducationalQuestion({
        grade,
        standardCode: targetStandard,
        preferOnline: false, // Ensure algorithmic formal generator is primary for endless variety
      });

      setCurrentQuestion(res.question);
      setEngineSource(res.source);

      const timerSec = mode === 'speed-sprint' ? 60 : diffInfo.timerSeconds || 25;
      setTimeLeft(timerSec);
    },
    [grade, mode, diffInfo, learnerProfile]
  );

  useEffect(() => {
    nextQuestion();
  }, [grade, mode, difficulty]);

  useEffect(() => {
    if (feedback || summaryOpen || !currentQuestion) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, feedback, summaryOpen]);

  const handleTimeOut = () => {
    handleAnswer('TIMEOUT_EXPIRED');
  };

  const handleAnswer = (givenAnswer) => {
    if (feedback || !currentQuestion) return;

    const isCorrect =
      String(givenAnswer).trim().toLowerCase() ===
      String(currentQuestion.correctAnswer).trim().toLowerCase();

    const responseTime = (diffInfo.timerSeconds || 25) - timeLeft;
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

    const isGameOver = !isCorrect && lives <= 1;

    if (isCorrect) {
      setScore((s) => s + pointsEarned);
      setStreak((st) => st + 1);
      setRoundStats((rs) => ({ correct: rs.correct + 1, total: rs.total + 1 }));
    } else {
      setStreak(0);
      setLives((l) => Math.max(0, l - 1));
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

    // Always advance cleanly without getting stuck
    setTimeout(() => {
      if (isGameOver) {
        if (soundEnabled) playVictorySound();
        setSummaryOpen(true);
      } else {
        nextQuestion();
      }
    }, 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (feedback || !currentQuestion?.options || summaryOpen) return;
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
    nextQuestion();
  };

  const mistakeStandards = getMistakeReviewStandards(learnerProfile, grade);

  return (
    <div className="app-container">
      <Header
        grade={grade}
        onGradeChange={setGrade}
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
        onOpenClassroom={() => setClassroomOpen(true)}
        onOpenCurriculum={() => setCurriculumOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenVault={() => setVaultOpen(true)}
        activeClassSession={classSession}
      />

      <div className="engine-status-strip">
        <div className="status-badge-container">
          <span className={`status-dot ${isNetworkOnline ? 'online' : 'offline'}`} />
          <span className="status-text">
            ⚡ Formal Mathematical Invariant Engine Active (Error-Free Seeded Generation)
          </span>
          <button
            type="button"
            className="skip-btn vault-quick-btn"
            onClick={() => setVaultOpen(true)}
            title="Inspect learned templates and sync online curriculum APIs"
            style={{ background: '#e8f0fe', color: '#1a73e8', borderColor: '#1a73e8' }}
          >
            🧠 AI Knowledge Vault
          </button>
          <button
            type="button"
            className="skip-btn"
            onClick={() => nextQuestion()}
            title="Skip to another fresh question"
          >
            Skip ➔
          </button>
        </div>
      </div>

      <ModeSelector
        currentMode={mode}
        onSelectMode={(m) => {
          setMode(m);
        }}
        mistakeCount={mistakeStandards.length}
      />

      <main className="main-game-layout">
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          timeLeft={timeLeft}
          totalTime={mode === 'speed-sprint' ? 60 : diffInfo.timerSeconds}
          feedback={feedback}
          showHints={diffInfo.showHints}
        />
      </main>

      <footer className="app-footer">
        <p>
          <strong>California Elementary Math Quest</strong> • California Common Core State Standards (CA CCSSM)
        </p>
        <p>
          Formally Verified Mathematical Constraint Engine (Grades K–5)
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
        onPracticeStandard={(code) => nextQuestion(code)}
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
