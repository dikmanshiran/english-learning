import { useGameStore } from '../store/gameStore';
import { useProfileStore } from '../store/profileStore';

interface HomeScreenProps {
  onStart: () => void;
  onSwitchPlayer: () => void;
}

export function HomeScreen({ onStart, onSwitchPlayer }: HomeScreenProps) {
  const { questionCount, setQuestionCount } = useGameStore();
  const { currentProfile } = useProfileStore();

  return (
    <div className="screen active">
      <div className="hero">
        <h1>English Adventure 🚀</h1>
        <p>
          {currentProfile
            ? `Welcome back, ${currentProfile.name}! 👋`
            : 'Learn English words the fun way!'}
        </p>
        <button className="back-btn" style={{ marginTop: '10px' }} onClick={onSwitchPlayer}>
          🔄 Switch Player
        </button>
      </div>

      <div className="section-title">How many questions?</div>
      <div className="unit-grid">
        <button
          className={`unit-btn${questionCount === 10 ? ' selected' : ''}`}
          onClick={() => setQuestionCount(10)}
        >
          <span className="unit-icon">⚡</span>
          10 Quick
        </button>
        <button
          className={`unit-btn${questionCount === 20 ? ' selected' : ''}`}
          onClick={() => setQuestionCount(20)}
        >
          <span className="unit-icon">🏆</span>
          20 Challenge
        </button>
      </div>

      <button className="start-btn" onClick={onStart}>
        🎮 Start Game!
      </button>
    </div>
  );
}
