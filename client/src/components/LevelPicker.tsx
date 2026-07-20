import { LEVELS, Level } from '../types/game';

interface LevelPickerProps {
  value: Level;
  onChange: (level: Level) => void;
}

export function LevelPicker({ value, onChange }: LevelPickerProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {LEVELS.map((lvl) => (
        <button
          key={lvl.id}
          type="button"
          onClick={() => onChange(lvl.id)}
          style={{
            flex: 1, padding: '10px 6px', borderRadius: '12px',
            border: value === lvl.id ? '2px solid var(--primary)' : '2px solid transparent',
            background: value === lvl.id ? 'rgba(108,63,197,0.2)' : 'var(--card)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>{lvl.icon}</span>
          <span style={{ fontSize: '0.75rem' }}>{lvl.labelHe}</span>
        </button>
      ))}
    </div>
  );
}
