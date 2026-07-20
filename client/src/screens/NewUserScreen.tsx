import { useState } from 'react';
import { AVATARS, AVATAR_COLORS, Level } from '../types/game';
import { useProfileStore } from '../store/profileStore';
import { LevelPicker } from '../components/LevelPicker';

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
        <LevelPicker value={level} onChange={setLevel} />
        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', marginTop: '8px' }}>
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
