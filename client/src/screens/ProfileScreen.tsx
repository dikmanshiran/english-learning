import { useProfileStore } from '../store/profileStore';

interface ProfileScreenProps {
  onSelectProfile: (id: string) => void;
  onNewPlayer: () => void;
  isLoggedIn?: boolean;
  email?: string | null;
  onLogout?: () => void;
}

export function ProfileScreen({ onSelectProfile, onNewPlayer, isLoggedIn, email, onLogout }: ProfileScreenProps) {
  const { profiles } = useProfileStore();
  const profileList = Object.values(profiles);

  return (
    <div className="screen active">
      <div className="profile-hero">
        <h1>English Adventure 🚀</h1>
        <p>Who's playing today?</p>
        {isLoggedIn && email && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>👤 {email}</span>
            <button
              onClick={onLogout}
              style={{ fontSize: '.75rem', color: 'var(--text-dim)', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="players-grid">
        {profileList.map((u) => (
          <div key={u.id} className="player-card" onClick={() => onSelectProfile(u.id)}>
            <div className="player-avatar" style={{ background: u.color }}>
              {u.avatar}
            </div>
            <div className="player-name">{u.name}</div>
            <div className="player-stats">
              {u.totalGames} games · ⭐{u.totalStars}
            </div>
          </div>
        ))}
        <div className="add-player-btn" onClick={onNewPlayer}>
          <span className="plus">➕</span>
          New Player
        </div>
      </div>
    </div>
  );
}
