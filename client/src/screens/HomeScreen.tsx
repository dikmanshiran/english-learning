import { useGameStore } from '../store/gameStore';
import { useProfileStore } from '../store/profileStore';

interface HomeScreenProps {
  onStartVocab: () => void;
  onStartExercises: () => void;
  onSwitchPlayer: () => void;
}

export function HomeScreen({ onStartVocab, onStartExercises, onSwitchPlayer }: HomeScreenProps) {
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

      {/* Mode selector */}
      <div className="section-title">What do you want to practice?</div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={onStartVocab}
          style={{
            flex: 1, padding: '20px 12px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6c3fc5, #9b59b6)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(108,63,197,0.4)',
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>📚</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Vocabulary</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Words & phrases</span>
        </button>

        <button
          onClick={onStartExercises}
          style={{
            flex: 1, padding: '20px 12px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #e76f51, #f4a261)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(231,111,81,0.4)',
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>📖</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Exercises</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>From the books</span>
        </button>
      </div>

      {/* Question count — only shown for vocab mode hint */}
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

    </div>
  );
}
