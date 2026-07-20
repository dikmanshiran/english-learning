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
import { useBuildLetterQuestions, useBuildFirstWordsQuestions } from './hooks/useBeginnerGame';
import { refreshToken, logout } from './services/authService';
import { saveSession } from './services/sessionService';
import { LETTERS_UNIT_ID, FIRST_WORDS_UNIT_ID } from './types/game';

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
  const buildLetterQuestions = useBuildLetterQuestions();
  const buildFirstWordsQuestions = useBuildFirstWordsQuestions();
  const pool = useQuestionPool(selectedUnits, currentProfile?.level ?? 'INTERMEDIATE');

  const fireConfetti = useCallback(() => setConfettiTrigger((n) => n + 1), []);

  // Pushes a browser history entry so the back/forward buttons work like
  // in-app navigation. `replace` is used only for the initial screen chosen
  // on mount, so browser-back from that first screen exits the app.
  const navigate = useCallback((next: Screen, opts?: { replace?: boolean }) => {
    if (opts?.replace) {
      window.history.replaceState({ screen: next }, '', `#${next}`);
    } else {
      window.history.pushState({ screen: next }, '', `#${next}`);
    }
    setScreen(next);
  }, []);

  // Browser back/forward fires this — read the screen out of history state
  // and apply it directly (not via `navigate`, which would push a new entry).
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const next = (event.state?.screen as Screen | undefined) ?? 'landing';
      setScreen(next);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // On mount: try silent token refresh
  useEffect(() => {
    refreshToken().then((ok) => {
      if (ok) {
        loadServerProfiles().then(() => navigate('profile', { replace: true }));
      } else {
        loadLocalProfiles();
        navigate('landing', { replace: true });
      }
    });
  }, []);

  async function handleLoginSuccess() {
    await loadServerProfiles();
    navigate('profile');
  }

  async function handleLogout() {
    try { await logout(); } catch { clearAuth(); }
    clearProfiles();
    loadLocalProfiles();
    navigate('landing');
  }

  function handleSelectProfile(id: string) {
    selectProfile(id);
    loadWordStats(id); // load adaptive weights for this child
    navigate('home');
  }

  function handleStart() {
    // Read the store directly rather than the destructured `selectedUnits` —
    // HomeScreen's folder pick calls setSelectedUnits() and onStartVocab() in
    // the same tick, before this component re-renders with the new value.
    const liveSelectedUnits = useGameStore.getState().selectedUnits;
    const folder = liveSelectedUnits[0];
    const qs =
      folder === LETTERS_UNIT_ID
        ? buildLetterQuestions(questionCount, wordStats)
        : folder === FIRST_WORDS_UNIT_ID
        ? buildFirstWordsQuestions(questionCount, wordStats)
        : buildQuestions(pool, questionCount, liveSelectedUnits, wordStats);
    if (qs.length === 0) {
      alert('אין שאלות ליחידות שנבחרו. בחר יחידות נוספות!');
      return;
    }
    resetGame();
    setQuestions(qs);
    navigate('game');
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

    navigate('results');
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
            <button className="form-btn primary" style={{ fontSize: '1.1rem', padding: '16px' }} onClick={() => navigate('login')}>
              🔐 כניסה
            </button>
            <button className="form-btn ghost" style={{ fontSize: '1.1rem', padding: '16px' }} onClick={() => navigate('register')}>
              📝 יצירת חשבון
            </button>
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '.85rem', margin: '4px 0' }}>— או —</div>
            <button className="form-btn ghost" style={{ fontSize: '1rem', padding: '14px' }} onClick={() => { loadLocalProfiles(); navigate('profile'); }}>
              👤 שחק כאורח
            </button>
          </div>
        </div>
      )}

      {screen === 'login' && (
        <LoginScreen
          onSuccess={handleLoginSuccess}
          onBack={() => navigate('landing')}
          onRegister={() => navigate('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onSuccess={handleLoginSuccess}
          onBack={() => navigate('landing')}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          onSelectProfile={handleSelectProfile}
          onNewPlayer={() => navigate('newUser')}
          isLoggedIn={isLoggedIn}
          onParentZone={() => { setDashboardProfileId(null); navigate('dashboard'); }}
        />
      )}

      {screen === 'dashboard' && (
        <DashboardScreen
          profileId={dashboardProfileId}
          onBack={() => navigate('profile')}
          onLogout={handleLogout}
        />
      )}

      {screen === 'newUser' && (
        <NewUserScreen
          onBack={() => navigate('profile')}
          onCreated={(id) => {
            selectProfile(id);
            navigate('home');
          }}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          onStartVocab={handleStart}
          onStartExercises={() => navigate('exercises')}
          onSwitchPlayer={() => navigate('profile')}
        />
      )}

      {screen === 'exercises' && (
        <ExercisesScreen
          onHome={() => navigate('home')}
          onConfetti={fireConfetti}
          onResults={(score, total) => {
            setExercisesResult({ score, total });
            const pct = total > 0 ? score / total : 0;
            if (pct >= 0.9) { fireConfetti(); setTimeout(fireConfetti, 400); }
            else if (pct >= 0.7) { fireConfetti(); }
            navigate('exercises-results');
          }}
        />
      )}

      {screen === 'exercises-results' && exercisesResult && (
        <ResultsScreen
          onPlayAgain={() => navigate('exercises')}
          onHome={() => navigate('home')}
          overrideScore={exercisesResult.score}
          overrideTotal={exercisesResult.total}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          onHome={() => navigate('home')}
          onResults={handleResults}
          onConfetti={fireConfetti}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          onPlayAgain={handleStart}
          onHome={() => navigate('home')}
        />
      )}
    </div>
  );
}
