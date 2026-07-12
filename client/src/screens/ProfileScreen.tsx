import { useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { ParentZoneModal } from '../components/ParentZoneModal';
import { LEVELS } from '../types/game';

interface ProfileScreenProps {
  onSelectProfile: (id: string) => void;
  onNewPlayer: () => void;
  isLoggedIn?: boolean;
  onParentZone?: () => void; // called after password verified
}

export function ProfileScreen({ onSelectProfile, onNewPlayer, isLoggedIn, onParentZone }: ProfileScreenProps) {
  const { profiles } = useProfileStore();
  const profileList = Object.values(profiles);
  const [showParentModal, setShowParentModal] = useState(false);

  function handleParentZone() {
    if (isLoggedIn) {
      setShowParentModal(true);
    }
  }

  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div className="profile-hero">
        <h1>English Adventure 🚀</h1>
        <p>מי משחק היום?</p>
      </div>

      {/* Child profile grid */}
      <div className="players-grid" style={{ flex: 1 }}>
        {profileList.length === 0 && (
          <div style={{ gridColumn: '1/-1', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
            {isLoggedIn ? 'עדיין אין פרופילים. הוסף ילד!' : 'עדיין אין שחקנים'}
          </div>
        )}
        {profileList.map((u) => (
          <div key={u.id} className="player-card" onClick={() => onSelectProfile(u.id)}>
            <div className="player-avatar" style={{ background: u.color }}>
              {u.avatar}
            </div>
            <div className="player-name">{u.name}</div>
            <div className="player-stats" style={{ direction: 'ltr' }}>
              🎮 {u.totalGames} · ⭐ {u.totalStars} · {LEVELS.find((l) => l.id === u.level)?.icon ?? '🌿'}
            </div>
          </div>
        ))}
        <div className="add-player-btn" onClick={onNewPlayer}>
          <span className="plus">➕</span>
          שחקן חדש
        </div>
      </div>

      {/* Parent Zone — subtle, bottom of screen */}
      {isLoggedIn && (
        <div style={{ textAlign: 'center', padding: '20px 0 8px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '12px' }}>
          <button
            onClick={handleParentZone}
            style={{
              background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.85rem', cursor: 'pointer', padding: '8px 16px',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              borderRadius: '10px',
              transition: 'color 0.2s',
            }}
          >
            🔐 אזור הורים
          </button>
        </div>
      )}

      {/* Guest banner */}
      {!isLoggedIn && (
        <div style={{
          textAlign: 'center', padding: '14px', margin: '8px 0',
          background: 'rgba(108,63,197,0.15)', borderRadius: '12px',
          fontSize: '0.8rem', color: 'var(--text-dim)',
        }}>
          משחק ללא שמירה ·{' '}
          <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
            הרשם כדי לשמור התקדמות
          </span>
        </div>
      )}

      {showParentModal && (
        <ParentZoneModal
          onSuccess={() => { setShowParentModal(false); onParentZone?.(); }}
          onClose={() => setShowParentModal(false)}
        />
      )}
    </div>
  );
}
