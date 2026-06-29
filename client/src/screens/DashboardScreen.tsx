import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { logout } from '../services/authService';

interface DashboardScreenProps {
  onPlay: () => void;
  onLogout: () => void;
}

export function DashboardScreen({ onPlay, onLogout }: DashboardScreenProps) {
  const { email } = useAuthStore();
  const { profiles } = useProfileStore();
  const profileList = Object.values(profiles);

  async function handleLogout() {
    await logout();
    onLogout();
  }

  return (
    <div className="screen active">
      <div className="profile-hero">
        <h1>English Adventure 🚀</h1>
        <p>Signed in as {email}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="section-title">Children Profiles</div>
        {profileList.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No profiles yet</div>
        )}
        {profileList.map((p) => (
          <div key={p.id} className="player-card" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="player-avatar" style={{ background: p.color, flexShrink: 0 }}>
              {p.avatar}
            </div>
            <div>
              <div className="player-name">{p.name}</div>
              <div className="player-stats">{p.totalGames} games · ⭐{p.totalStars}</div>
            </div>
          </div>
        ))}
        <button className="start-btn" onClick={onPlay}>
          🎮 Start Playing
        </button>
        <button className="result-btn secondary" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
