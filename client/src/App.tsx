import { useState, useCallback, useEffect } from 'react';
import { Confetti } from './components/Confetti';
import { ProfileScreen } from './screens/ProfileScreen';
import { NewUserScreen } from './screens/NewUserScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { useGameStore } from './store/gameStore';
import { useProfileStore } from './store/profileStore';
import { useAuthStore } from './store/authStore';
import { useBuildQuestions } from './hooks/useGame';
import { useQuestionPool } from './hooks/useQuestionPool';
import { refreshToken, logout } from './services/authService';
import { saveSession } from './services/sessionService';

type Screen = 'landing' | 'login' | 'register' | 'profile' | 'newUser' | 'home' | 'game' | 'results' | 'dashboard' | 'exercises' | 'exercises-results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [dashboardProfileId, setDashboardProfileId] = useState<string | null>(null);
  const [exercisesResult, setExercisesResult] = useState<{ score: number; total: number } | null>(null);
  const { isLoggedIn, clearAuth } = useAuthStore();

  const { selectedUnits, questionCount, setQuestions, resetGame } = useGameStore();
  const { selectProfile, updateProfileStats, currentProfile, loadServerProfiles, loadLocalProfiles, loadWordStats, clearProfiles, isServerBacked, wordStats } = useProfileStore();
  const buildQuestions = useBuildQuestions();
  const pool = useQuestionPool(selectedUnits, currentProfile?.level ?? 'INTERMEDIATE');

  const fireConfetti = useCallback(() => setConfettiTrigger((n) => n + 1), []);

  // On mount: try silent token refresh
  useEffect(() => {
    refreshToken().then((ok) => {
      if (ok) {
        loadServerProfiles().then(() => setScreen('profile'));
      } else {
        loadLocalProfiles();
        setScreen('landing');
      }
    });
  }, []);

  async function handleLoginSuccess() {
    await loadServerProfiles();
    setScreen('profile');
  }

  async function handleLogout() {
    try { await logout(); } catch { clearAuth(); }
    clearProfiles();
    loadLocalProfiles();
    setScreen('landing');
  }

  function handleSelectProfile(id: string) {
    selectProfile(id);
    loadWordStats(id); // load adaptive weights for this child
    setScreen('home');
  }

  function handleStart() {
    const qs = buildQuestions(pool, questionCount, selectedUnits, wordStats);
    if (qs.length === 0) {
      alert('אין שאלות ליחידות שנבחרו. בחר יחידות נוספות!');
      return;
    }
    resetGame();
    setQuestions(qs);
    setScreen('game');
  }

  async function handleResults() {
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

      // Save session to server when logged in
      if (isServerBacked) {
        try {
          await saveSession(
            currentProfile.id,
            selectedUnits.filter((u): u is number => u !== 'all'),
            state.questions.length,
            state.score,
            starsCount,
            state.lives,
            state.questionLog,
            state.wrongAnswers,
          );
        } catch (err) {
          console.error('Failed to save session:', err);
        }
        // Refresh word stats so next game uses updated weights
        loadWordStats(currentProfile.id);
      }
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

      {screen === 'landing' && (
        <div className="screen active">
          <div className="profile-hero">
            <h1>English Adventure 🚀</h1>
            <p>למד אנגלית, מילה אחת בכל פעם!</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '340px', margin: '0 auto', padding: '0 20px' }}>
            <button className="form-btn primary" style={{ fontSize: '1.1rem', padding: '16px' }} onClick={() => setScreen('login')}>
              🔐 כניסה
            </button>
            <button className="form-btn ghost" style={{ fontSize: '1.1rem', padding: '16px' }} onClick={() => setScreen('register')}>
              📝 יצירת חשבון
            </button>
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '.85rem', margin: '4px 0' }}>— או —</div>
            <button className="form-btn ghost" style={{ fontSize: '1rem', padding: '14px' }} onClick={() => { loadLocalProfiles(); setScreen('profile'); }}>
              👤 שחק כאורח
            </button>
          </div>
        </div>
      )}

      {screen === 'login' && (
        <LoginScreen
          onSuccess={handleLoginSuccess}
          onBack={() => setScreen('landing')}
          onRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onSuccess={handleLoginSuccess}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          onSelectProfile={handleSelectProfile}
          onNewPlayer={() => setScreen('newUser')}
          isLoggedIn={isLoggedIn}
          onParentZone={() => { setDashboardProfileId(null); setScreen('dashboard'); }}
        />
      )}

      {screen === 'dashboard' && (
        <DashboardScreen
          profileId={dashboardProfileId}
          onBack={() => setScreen('profile')}
          onLogout={handleLogout}
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
        <HomeScreen
          onStartVocab={handleStart}
          onStartExercises={() => setScreen('exercises')}
          onSwitchPlayer={() => setScreen('profile')}
        />
      )}

      {screen === 'exercises' && (
        <ExercisesScreen
          onHome={() => setScreen('home')}
          onResults={(score, total) => {
            setExercisesResult({ score, total });
            const pct = total > 0 ? score / total : 0;
            if (pct >= 0.9) { fireConfetti(); setTimeout(fireConfetti, 400); }
            else if (pct >= 0.7) { fireConfetti(); }
            setScreen('exercises-results');
          }}
        />
      )}

      {screen === 'exercises-results' && exercisesResult && (
        <ResultsScreen
          onPlayAgain={() => setScreen('exercises')}
          onHome={() => setScreen('home')}
          overrideScore={exercisesResult.score}
          overrideTotal={exercisesResult.total}
        />
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
          onPlayAgain={handleStart}
          onHome={() => setScreen('home')}
        />
      )}
    </div>
  );
}
