import { create } from 'zustand';
import { UserProfile, AVATARS, AVATAR_COLORS } from '../types/game';
import { v4 as uuidv4 } from 'uuid';
import * as profilesService from '../services/profilesService';

function loadLocalProfiles(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem('ea_users') || '{}');
  } catch {
    return {};
  }
}

function saveLocalProfiles(profiles: Record<string, UserProfile>) {
  localStorage.setItem('ea_users', JSON.stringify(profiles));
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  currentProfile: UserProfile | null;
  isServerBacked: boolean; // true when logged in and using server profiles

  // Load profiles from server (when logged in)
  loadServerProfiles: () => Promise<void>;
  // Load profiles from localStorage (guest mode)
  loadLocalProfiles: () => void;

  createProfile: (name: string, avatar: string, color: string) => Promise<UserProfile>;
  selectProfile: (id: string) => void;
  updateProfileStats: (
    id: string,
    starsEarned: number,
    questionLog: Array<{ questionText: string; firstTryCorrect: boolean }>
  ) => void;
  clearCurrentProfile: () => void;
  clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: loadLocalProfiles(),
  currentProfile: null,
  isServerBacked: false,

  loadServerProfiles: async () => {
    const serverProfiles = await profilesService.fetchProfiles();
    const profiles: Record<string, UserProfile> = {};
    for (const p of serverProfiles) {
      profiles[p.id] = p;
    }
    set({ profiles, isServerBacked: true });
  },

  loadLocalProfiles: () => {
    set({ profiles: loadLocalProfiles(), isServerBacked: false });
  },

  createProfile: async (name: string, avatar: string, color: string): Promise<UserProfile> => {
    const { isServerBacked } = get();
    if (isServerBacked) {
      const profile = await profilesService.createProfile(name, avatar, color);
      const profiles = { ...get().profiles, [profile.id]: profile };
      set({ profiles });
      return profile;
    } else {
      const id = uuidv4();
      const profile: UserProfile = { id, name, avatar, color, totalGames: 0, totalStars: 0, stats: {} };
      const profiles = { ...get().profiles, [id]: profile };
      saveLocalProfiles(profiles);
      set({ profiles });
      return profile;
    }
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
    const { isServerBacked } = get();
    const profiles = { ...get().profiles };
    const profile = profiles[id];
    if (!profile) return;

    profile.totalGames = (profile.totalGames || 0) + 1;
    profile.totalStars = (profile.totalStars || 0) + starsEarned;

    // Only persist stats locally in guest mode (server tracks them in DB when logged in)
    if (!isServerBacked) {
      if (!profile.stats) profile.stats = {};
      for (const { questionText, firstTryCorrect } of questionLog) {
        if (!profile.stats[questionText]) {
          profile.stats[questionText] = { correct: 0, wrong: 0, lastSeen: 0 };
        }
        if (firstTryCorrect) profile.stats[questionText].correct++;
        else profile.stats[questionText].wrong++;
        profile.stats[questionText].lastSeen = Date.now();
      }
      saveLocalProfiles(profiles);
    }

    set({ profiles, currentProfile: profile });
  },

  clearCurrentProfile: () => set({ currentProfile: null }),

  clearProfiles: () => {
    set({ profiles: {}, currentProfile: null, isServerBacked: false });
  },
}));

export { AVATARS, AVATAR_COLORS };
