import { create } from 'zustand';
import { UserProfile, AVATARS, AVATAR_COLORS } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

function loadProfiles(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem('ea_users') || '{}');
  } catch {
    return {};
  }
}

function saveProfiles(profiles: Record<string, UserProfile>) {
  localStorage.setItem('ea_users', JSON.stringify(profiles));
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  currentProfile: UserProfile | null;
  loadProfiles: () => void;
  createProfile: (name: string, avatar: string, color: string) => UserProfile;
  selectProfile: (id: string) => void;
  updateProfileStats: (
    id: string,
    starsEarned: number,
    questionLog: Array<{ questionText: string; firstTryCorrect: boolean }>
  ) => void;
  clearCurrentProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: loadProfiles(),
  currentProfile: null,

  loadProfiles: () => {
    set({ profiles: loadProfiles() });
  },

  createProfile: (name: string, avatar: string, color: string): UserProfile => {
    const id = uuidv4();
    const profile: UserProfile = { id, name, avatar, color, totalGames: 0, totalStars: 0, stats: {} };
    const profiles = { ...get().profiles, [id]: profile };
    saveProfiles(profiles);
    set({ profiles });
    return profile;
  },

  selectProfile: (id: string) => {
    const profile = get().profiles[id];
    if (profile) set({ currentProfile: profile });
  },

  updateProfileStats: (
    id: string,
    starsEarned: number,
    questionLog: Array<{ questionText: string; firstTryCorrect: boolean }>
  ) => {
    const profiles = { ...get().profiles };
    const profile = profiles[id];
    if (!profile) return;
    profile.totalGames = (profile.totalGames || 0) + 1;
    profile.totalStars = (profile.totalStars || 0) + starsEarned;
    if (!profile.stats) profile.stats = {};
    for (const { questionText, firstTryCorrect } of questionLog) {
      if (!profile.stats[questionText]) {
        profile.stats[questionText] = { correct: 0, wrong: 0, lastSeen: 0 };
      }
      if (firstTryCorrect) profile.stats[questionText].correct++;
      else profile.stats[questionText].wrong++;
      profile.stats[questionText].lastSeen = Date.now();
    }
    saveProfiles(profiles);
    set({ profiles, currentProfile: profile });
  },

  clearCurrentProfile: () => set({ currentProfile: null }),
}));

export { AVATARS, AVATAR_COLORS };
