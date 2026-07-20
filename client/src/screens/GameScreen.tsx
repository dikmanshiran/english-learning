import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useProfileStore } from '../store/profileStore';
import { ProgressBar } from '../components/ProgressBar';
import { Hearts } from '../components/Hearts';
import { QuestionCard } from '../components/QuestionCard';
import { OptionButton } from '../components/OptionButton';
import { playTone, speak } from '../hooks/useGame';

const CORRECT_MESSAGES = ['✅ Correct! Well done!', '🎉 Great job!', '⭐ Excellent!', '💪 You got it!'];

interface GameScreenProps {
  onHome: () => void;
  onResults: () => void;
  onConfetti: () => void;
}

export function GameScreen({ onHome, onResults, onConfetti }: GameScreenProps) {
  const {
    questions,
    currentQ,
    score,
    lives,
    streak,
    answered,
    resetting,
    markAnswered,
    markResetting,
    incrementScore,
    incrementStreak,
    resetStreak,
    loseLife,
    nextQuestion,
    addWrongAnswer,
    addQuestionLog,
    markCurrentWrongLogged,
  } = useGameStore();

  const { currentProfile } = useProfileStore();

  const [shake, setShake] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'wrong' } | null>(null);
  const [optionStates, setOptionStates] = useState<Record<string, 'default' | 'correct' | 'wrong' | 'disabled'>>({});
  const [showNext, setShowNext] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'correct' | 'wrong' | null>(null);

  const q = questions[currentQ];
  const isListenKind = q?.kind === 'listen' || q?.kind === 'letter-listen';

  // Reset per question
  useEffect(() => {
    if (!q) return;
    setFeedback(null);
    setOptionStates({});
    setShowNext(false);
    setShake(false);
    setPlaying(false);
    setScreenFlash(null);
    if (isListenKind) {
      const timer = setTimeout(() => triggerSpeak(), 400);
      return () => clearTimeout(timer);
    }
  }, [currentQ, q?.question]);

  const triggerSpeak = useCallback(() => {
    if (!q || !isListenKind) return;
    setPlaying(true);
    speak(q.question, () => setPlaying(false));
  }, [q, isListenKind]);

  function handleAnswer(chosen: string) {
    if (answered || resetting) return;
    const correct = chosen === q.answer;

    if (correct) {
      markAnswered();
      const firstTry = !q._wrongLogged;
      addQuestionLog({ q, firstTryCorrect: firstTry });
      const bonus = streak >= 3 ? 2 : 1;
      incrementStreak();
      incrementScore(bonus);

      setOptionStates((prev) => {
        const next: Record<string, 'correct' | 'wrong' | 'disabled'> = {};
        q.options.forEach((opt) => {
          next[opt] = opt === chosen ? 'correct' : 'disabled';
        });
        return { ...prev, ...next };
      });

      const newStreak = streak + 1;
      setFeedback({
        text:
          newStreak >= 3
            ? `🔥 Awesome! +${bonus} (streak bonus!)`
            : CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)],
        type: 'correct',
      });

      setScreenFlash('correct');
      onConfetti();
      if (newStreak === 5 || (score + bonus) % 10 === 0) setTimeout(onConfetti, 300);
      playTone(true);
      setShowNext(true);
    } else {
      if (!q._wrongLogged) {
        markCurrentWrongLogged();
        resetStreak();
        loseLife();
        addWrongAnswer({ q, chosen, correct: q.answer });
      }
      markResetting(true);
      setOptionStates((prev) => ({ ...prev, [chosen]: 'wrong' }));
      setFeedback({ text: '❌ Not quite — try again!', type: 'wrong' });
      setScreenFlash('wrong');
      setShake(true);
      playTone(false);

      setTimeout(() => {
        setShake(false);
        setOptionStates((prev) => {
          const next = { ...prev };
          delete next[chosen];
          return next;
        });
        setFeedback(null);
        setScreenFlash(null);
        markResetting(false);
      }, 800);

      // End if no lives
      const newLives = useGameStore.getState().lives;
      if (newLives <= 0) {
        markAnswered();
        setOptionStates(() => {
          const next: Record<string, 'disabled'> = {};
          q.options.forEach((opt) => { next[opt] = 'disabled'; });
          return next;
        });
        setShowNext(true);
      }
    }
  }

  function handleNext() {
    const state = useGameStore.getState();
    if (state.currentQ + 1 >= state.questions.length || state.lives <= 0) {
      onResults();
    } else {
      nextQuestion();
    }
  }

  if (!q) return null;

  const isHebrewOptions = q.kind === 'e2h' || q.kind === 'listen';
  const isLast = currentQ + 1 >= questions.length;

  return (
    <div className="screen active">
      {screenFlash && <div className={`screen-flash ${screenFlash}`} />}
      <div className="game-header">
        <div>
          <button className="back-btn" onClick={onHome}>
            ← Home
          </button>
          {currentProfile && (
            <div className="user-badge">
              {currentProfile.avatar} {currentProfile.name}
            </div>
          )}
        </div>
        <div className="score-display">
          <span className="stars-count">⭐ {score}</span>
          <Hearts lives={lives} />
        </div>
      </div>

      <ProgressBar current={currentQ} total={questions.length} />

      <div className="streak-badge">{streak >= 3 ? `🔥 ${streak} in a row!` : ''}</div>

      <QuestionCard question={q} shake={shake} playing={playing} onPlay={triggerSpeak} />

      <div className="options-grid">
        {q.options.map((opt) => (
          <OptionButton
            key={opt}
            text={opt}
            isHebrew={isHebrewOptions}
            state={optionStates[opt] || 'default'}
            onClick={() => handleAnswer(opt)}
          />
        ))}
      </div>

      {feedback && (
        <div className={`feedback show ${feedback.type}`}>{feedback.text}</div>
      )}

      {showNext && (
        <button className="next-btn show" onClick={handleNext}>
          {isLast || lives <= 0 ? 'See Results 🏆' : 'Next ➜'}
        </button>
      )}
    </div>
  );
}
