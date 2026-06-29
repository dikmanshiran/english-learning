import { useGameStore } from '../store/gameStore';
import { UNITS } from '../types/game';
import { useProfileStore } from '../store/profileStore';

interface HomeScreenProps {
  onStart: () => void;
  onSwitchPlayer: () => void;
}

export function HomeScreen({ onStart, onSwitchPlayer }: HomeScreenProps) {
  const { selectedUnits, questionCount, setSelectedUnits, setQuestionCount } = useGameStore();
  const { currentProfile } = useProfileStore();

  function toggleUnit(u: number | 'all') {
    if (u === 'all') {
      setSelectedUnits(['all']);
      return;
    }
    let next = (selectedUnits.filter((x) => x !== 'all') as number[]);
    const idx = next.indexOf(u);
    if (idx > -1) {
      next = next.filter((x) => x !== u);
    } else {
      next = [...next, u];
    }
    if (next.length === 0) {
      setSelectedUnits(['all']);
      return;
    }
    setSelectedUnits(next);
  }

  const isAllSelected = selectedUnits.includes('all');

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

      <div className="section-title">Choose units to practice</div>
      <div className="unit-grid">
        <button
          className={`unit-btn all${isAllSelected ? ' selected' : ''}`}
          onClick={() => toggleUnit('all')}
        >
          <span className="unit-icon">🌟</span>
          All Units (Mix)
        </button>
        {UNITS.map((unit) => (
          <button
            key={unit.id}
            className={`unit-btn${!isAllSelected && selectedUnits.includes(unit.id) ? ' selected' : ''}`}
            data-unit={unit.id}
            onClick={() => toggleUnit(unit.id)}
          >
            <span className="unit-icon">{unit.icon}</span>
            Unit {unit.id}
            <br />
            {unit.name}
          </button>
        ))}
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
