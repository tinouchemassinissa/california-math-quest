import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ModeSelector, { GAME_MODES } from './components/ModeSelector.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ClassroomModal from './components/ClassroomModal.jsx';
import CurriculumBrowser from './components/CurriculumBrowser.jsx';
import HelpGuide from './components/HelpGuide.jsx';
import SummaryModal from './components/SummaryModal.jsx';
import {
  generateQuestion,
  STANDARDS,
  DISTRICT_INFO,
} from './data/cambrianCurriculum.js';
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
import {
  playCorrectSound,
  playIncorrectSound,
  playVictorySound,
  playStreakChime,
  startFocusMusic,
  stopFocusMusic,
} from './audio.js';

const STORAGE_KEYS = {
  PROFILE: 'cambrian_math_profile_v1',
  THEME: 'cambrian_math_theme_v1',
  SOUND: 'cambrian_math_sound_v1',
  MUSIC: 'cambrian_math_music_v1',
  SESSION: 'cambrian_math_session_v1',
};

export default function App() {
  // Theme & Audio state
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MUSIC);
    return saved !== null ? saved === 'true' : false;
  });

  // Curriculum & District settings
  const [grade, setGrade] = useState('3');
  const [schoolId, setSchoolId] = useState('fammatre');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [mode, setMode] = useState('grade-quest');

  // Gameplay state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const diffInfo = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.intermediate;
  const [lives, setLives] = useState(diffInfo.lives);
  const [feedback, setFeedback] = useState(null); // { status, answer }
  const [roundStats, setRoundStats] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(diffInfo.timerSeconds);
  const timerRef = useRef(null);

  // Modals state
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Persistent Learner Profile & Classroom Session
  const [learnerProfile, setLearnerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : createInitialProfile('3', 'fammatre');
    } catch {
      return createInitialProfile('3', 'fammatre');
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

  // Save profile and theme changes
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

  // Generate question based on current mode & grade
  const nextQuestion = useCallback(
    (customStandard = null) => {
      setFeedback(null);
      let q = null;

      if (customStandard) {
        const std = STANDARDS[customStandard];
        q = generateQuestion(std?.grade || grade, std?.domain);
      } else if (mode === 'mistake-review') {
        const mistakes = getMistakeReviewStandards(learnerProfile, grade);
        if (mistakes.length) {
          const pickCode = mistakes[Math.floor(Math.random() * mistakes.length)];
          const std = STANDARDS[pickCode];
          q = generateQuestion(grade, std?.domain);
        } else {
          q = selectAdaptiveQuestion(grade, learnerProfile);
        }
      } else if (mode === 'manipulatives') {
        // Generate with manipulatives priority
        q = generateQuestion(grade);
      } else if (mode === 'word-problems') {
        // Prefer OA or MD word problems
        q = generateQuestion(grade, 'OA');
      } else if (mode === 'smart-review') {
        q = selectAdaptiveQuestion(grade, learnerProfile);
      } else {
        // Grade Quest default
        q = generateQuestion(grade);
      }

      setCurrentQuestion(q);
      const timerSec =
        mode === 'speed-sprint' ? 60 : diffInfo.timerSeconds || 25;
      setTimeLeft(timerSec);
    },
    [grade, mode, diffInfo, learnerProfile]
  );

  // Initialize first question
  useEffect(() => {
    nextQuestion();
  }, [grade, mode, difficulty]);

  // Timer countdown
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

    // Audio Feedback
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

    // Update Scores & Lives
    if (isCorrect) {
      setScore((s) => s + pointsEarned);
      setStreak((st) => st + 1);
      setRoundStats((rs) => ({ correct: rs.correct + 1, total: rs.total + 1 }));
    } else {
      setStreak(0);
      setLives((l) => {
        const nextLives = Math.max(0, l - 1);
        if (nextLives === 0) {
          setTimeout(() => {
            if (soundEnabled) playVictorySound();
            setSummaryOpen(true);
          }, 1200);
        }
        return nextLives;
      });
      setRoundStats((rs) => ({ ...rs, total: rs.total + 1 }));
    }

    // Update Learner Profile
    setLearnerProfile((prev) =>
      updateLearnerProfile(prev, currentQuestion.standard, isCorrect)
    );

    // Record in active classroom session if enabled
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

    // Advance to next question after delay
    setTimeout(() => {
      if (lives > 1 || isCorrect) {
        nextQuestion();
      }
    }, 1200);
  };

  // Keyboard navigation support (1, 2, 3, 4 for options A, B, C, D)
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

  const handleStartClassSession = ({ teacherName, className, schoolId }) => {
    const newSession = createClassSession({
      teacherName,
      className,
      schoolId,
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
        schoolId={schoolId}
        onSchoolChange={setSchoolId}
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
        activeClassSession={classSession}
      />

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
          <strong>Cambrian Math Quest</strong> • California Common Core State Standards (CCSS-M)
          Elementary Program
        </p>
        <p>
          Serving Fammatre, Farnham, Sartorette, Bagby & Steindorf STEAM School • Cambrian Park, San Jose, CA
        </p>
      </footer>

      {/* Classroom Portal Modal */}
      <ClassroomModal
        isOpen={classroomOpen}
        onClose={() => setClassroomOpen(false)}
        session={classSession}
        onStartSession={handleStartClassSession}
        onUpdateActiveStudent={handleUpdateActiveStudent}
      />

      {/* Standards Curriculum Map Modal */}
      <CurriculumBrowser
        isOpen={curriculumOpen}
        onClose={() => setCurriculumOpen(false)}
        learnerProfile={learnerProfile}
        onPracticeStandard={(code) => nextQuestion(code)}
      />

      {/* Help Guide Modal */}
      <HelpGuide isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Round Complete Summary Modal */}
      <SummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
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
