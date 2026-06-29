import { useState } from 'react';
import { AVATARS, AVATAR_COLORS } from '../types/game';
import { useProfileStore } from '../store/profileStore';

interface NewUserScreenProps {
  onBack: () => void;
  onCreated: (id: string) => void;
}

export function NewUserScreen({ onBack, onCreated }: NewUserScreenProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [name, setName] = useState('');
  const { createProfile } = useProfileStore();

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const colorIdx = AVATARS.indexOf(selectedAvatar);
    const color = AVATAR_COLORS[colorIdx >= 0 ? colorIdx : 0];
    const profile = createProfile(trimmed, selectedAvatar, color);
    onCreated(profile.id);
  }

  return (
    <div className="screen active">
      <div className="form-card">
        <h2>👤 New Player</h2>
        <p>Pick an avatar and enter your name</p>
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
          placeholder="Your name..."
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
        <div className="form-btns">
          <button className="form-btn ghost" onClick={onBack}>
            ← Back
          </button>
          <button className="form-btn primary" onClick={handleCreate}>
            Let's go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
