import { useState, useCallback } from 'react';
import { Confetti } from './components/Confetti';
import { ProfileScreen } from './screens/ProfileScreen';
import { NewUserScreen } from './screens/NewUserScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { useGameStore } from './store/gameStore';
import { useProfileStore } from './store/profileStore';
import { useBuildQuestions } from './hooks/useGame';
import { useQuestionPool } from './hooks/useQuestionPool';

type Screen = 'profile' | 'newUser' | 'home' | 'game' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('profile');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const { selectedUnits, questionCount, setQuestions, resetGame } = useGameStore();
  const { selectProfile, updateProfileStats, currentProfile } = useProfileStore();
  const buildQuestions = useBuildQuestions();
  const pool = useQuestionPool(selectedUnits);

  const fireConfetti = useCallback(() => setConfettiTrigger((n) => n + 1), []);

  function handleSelectProfile(id: string) {
    selectProfile(id);
    setScreen('home');
  }

  function handleStart() {
    const qs = buildQuestions(pool, questionCount, selectedUnits);
    if (qs.length === 0) {
      alert('No questions available for selected units. Please select more units!');
      return;
    }
    resetGame();
    setQuestions(qs);
    setScreen('game');
  }

  function handleResults() {
    // Save stats locally
    const state = useGameStore.getState();
    const starsCount = (function () {
      const total = state.questions.length;
      const pct = total > 0 ? state.score / total : 0;
      if (state.lives === 0) return state.score >= total * 0.5 ? 2 : 1;
      if (pct >= 0.7) return 3;
      if (pct >= 0.5) return 2;
      return 1;
    })();

    if (currentProfile) {
      const log = state.questionLog.map(({ q, firstTryCorrect }) => ({
        questionText: q.question,
        firstTryCorrect,
      }));
      updateProfileStats(currentProfile.id, starsCount, log);
    }

    // Confetti on great results
    const pct = state.questions.length > 0 ? state.score / state.questions.length : 0;
    if (pct >= 0.9) {
      fireConfetti();
      setTimeout(fireConfetti, 400);
    } else if (pct >= 0.7) {
      fireConfetti();
    }

    setScreen('results');
  }

  return (
    <div id="app">
      <Confetti trigger={confettiTrigger} />

      {screen === 'profile' && (
        <ProfileScreen
          onSelectProfile={handleSelectProfile}
          onNewPlayer={() => setScreen('newUser')}
        />
      )}

      {screen === 'newUser' && (
        <NewUserScreen
          onBack={() => setScreen('profile')}
          onCreated={(id) => {
            selectProfile(id);
            setScreen('home');
          }}
        />
      )}

      {screen === 'home' && (
        <HomeScreen onStart={handleStart} onSwitchPlayer={() => setScreen('profile')} />
      )}

      {screen === 'game' && (
        <GameScreen
          onHome={() => setScreen('home')}
          onResults={handleResults}
          onConfetti={fireConfetti}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          onPlayAgain={() => {
            handleStart();
          }}
          onHome={() => setScreen('home')}
        />
      )}
    </div>
  );
}
