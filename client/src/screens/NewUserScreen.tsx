import { useState } from 'react';
import { AVATARS, AVATAR_COLORS, LEVELS, Level } from '../types/game';
import { useProfileStore } from '../store/profileStore';

interface NewUserScreenProps {
  onBack: () => void;
  onCreated: (id: string) => void;
}

export function NewUserScreen({ onBack, onCreated }: NewUserScreenProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level>('INTERMEDIATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createProfile } = useProfileStore();

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const colorIdx = AVATARS.indexOf(selectedAvatar);
      const color = AVATAR_COLORS[colorIdx >= 0 ? colorIdx : 0];
      const profile = await createProfile(trimmed, selectedAvatar, color, level);
      onCreated(profile.id);
    } catch {
      setError('שגיאה ביצירת הפרופיל. נסה שוב.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen active">
      <div className="form-card">
        <h2>👤 שחקן חדש</h2>
        <p>בחר אווטאר והזן שם</p>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <div
              key={a}
              className={`avatar-opt${selectedAvatar === a ? ' selected' : ''}`}
              onClick={() => setSelectedAvatar(a)}
            >
              {a}
            </div>
          ))}
        </div>
        <input
          className="name-input"
          type="text"
          placeholder="שם הילד..."
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
        <p style={{ marginTop: '14px', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          באיזו רמה להתחיל?
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setLevel(lvl.id)}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: '12px',
                border: level === lvl.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: level === lvl.id ? 'rgba(108,63,197,0.2)' : 'var(--color-surface-1)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{lvl.icon}</span>
              <span style={{ fontSize: '0.75rem' }}>{lvl.labelHe}</span>
            </button>
          ))}
        </div>
        {error && (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', textAlign: 'center', marginTop: '8px' }}>
            {error}
          </div>
        )}
        <div className="form-btns">
          <button className="form-btn ghost" onClick={onBack} disabled={loading}>
            ← חזור
          </button>
          <button className="form-btn primary" onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? '...' : 'יאללה! 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}
