import { useProfileStore } from '../store/profileStore';

interface ProfileScreenProps {
  onSelectProfile: (id: string) => void;
  onNewPlayer: () => void;
}

export function ProfileScreen({ onSelectProfile, onNewPlayer }: ProfileScreenProps) {
  const { profiles } = useProfileStore();
  const profileList = Object.values(profiles);

  return (
    <div className="screen active">
      <div className="profile-hero">
        <h1>English Adventure 🚀</h1>
        <p>Who's playing today?</p>
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
