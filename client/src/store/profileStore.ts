import { create } from 'zustand';
import { UserProfile, AVATARS, AVATAR_COLORS, Level } from '../types/game';
import { v4 as uuidv4 } from 'uuid';
import * as profilesService from '../services/profilesService';
import { getWordStats } from '../services/statsService';

export interface WordStat {
  wordKey: string;
  correct: number;
  wrong: number;
  mastery: 'UNSEEN' | 'STRUGGLING' | 'LEARNING' | 'MASTERED';
}

function loadLocalProfiles(): Record<string, UserProfile> {
  try {
    const profiles: Record<string, UserProfile> = JSON.parse(localStorage.getItem('ea_users') || '{}');
    // Backfill level for profiles saved before levels existed.
    for (const p of Object.values(profiles)) {
      if (!p.level) p.level = 'INTERMEDIATE';
    }
    return profiles;
  } catch {
    return {};
  }
}

function saveLocalProfiles(profiles: Record<string, UserProfile>) {
  localStorage.setItem('ea_users', JSON.stringify(profiles));
}

// Derive word stats from local profile stats (guest mode)
function deriveLocalWordStats(profile: UserProfile): WordStat[] {
  return Object.entries(profile.stats || {}).map(([wordKey, s]) => {
    const total = s.correct + s.wrong;
    const accuracy = total > 0 ? s.correct / total : 0;
    const mastery = total === 0 ? 'UNSEEN'
      : accuracy < 0.3 ? 'STRUGGLING'
      : accuracy < 0.7 ? 'LEARNING'
      : 'MASTERED';
    return { wordKey, correct: s.correct, wrong: s.wrong, mastery };
  });
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  currentProfile: UserProfile | null;
  isServerBacked: boolean;
  // wordKey → stat, for the currently selected profile
  wordStats: Record<string, WordStat>;

  loadServerProfiles: () => Promise<void>;
  loadLocalProfiles: () => void;
  loadWordStats: (profileId: string) => Promise<void>;

  createProfile: (name: string, avatar: string, color: string, level?: Level) => Promise<UserProfile>;
  selectProfile: (id: string) => void;
  updateProfileLevel: (id: string, level: Level) => Promise<void>;
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
  wordStats: {},

  loadServerProfiles: async () => {
    const serverProfiles = await profilesService.fetchProfiles();
    const profiles: Record<string, UserProfile> = {};
    for (const p of serverProfiles) {
      profiles[p.id] = p;
    }
    set({ profiles, isServerBacked: true });
  },

  loadLocalProfiles: () => {
    set({ profiles: loadLocalProfiles(), isServerBacked: false, wordStats: {} });
  },

  loadWordStats: async (profileId: string) => {
    const { isServerBacked, profiles } = get();
    if (isServerBacked) {
      try {
        const stats: WordStat[] = await getWordStats(profileId);
        const wordStats: Record<string, WordStat> = {};
        for (const s of stats) wordStats[s.wordKey] = s;
        set({ wordStats });
      } catch {
        // non-fatal
      }
    } else {
      const profile = profiles[profileId];
      if (profile) {
        const stats = deriveLocalWordStats(profile);
        const wordStats: Record<string, WordStat> = {};
        for (const s of stats) wordStats[s.wordKey] = s;
        set({ wordStats });
      }
    }
  },

  createProfile: async (name: string, avatar: string, color: string, level: Level = 'INTERMEDIATE'): Promise<UserProfile> => {
    const { isServerBacked } = get();
    if (isServerBacked) {
      const profile = await profilesService.createProfile(name, avatar, color, level);
      const profiles = { ...get().profiles, [profile.id]: profile };
      set({ profiles });
      return profile;
    } else {
      const id = uuidv4();
      const profile: UserProfile = { id, name, avatar, color, level, totalGames: 0, totalStars: 0, stats: {} };
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

  updateProfileLevel: async (id: string, level: Level) => {
    const { isServerBacked } = get();
    const profiles = { ...get().profiles };
    const profile = profiles[id];
    if (!profile) return;

    if (isServerBacked) {
      const updated = await profilesService.updateProfile(id, { level });
      profiles[id] = updated;
    } else {
      profiles[id] = { ...profile, level };
      saveLocalProfiles(profiles);
    }

    set({
      profiles,
      currentProfile: get().currentProfile?.id === id ? profiles[id] : get().currentProfile,
    });
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

      // Update in-memory wordStats too
      const wordStats = { ...get().wordStats };
      for (const { questionText, firstTryCorrect } of questionLog) {
        const existing = wordStats[questionText] || { wordKey: questionText, correct: 0, wrong: 0, mastery: 'UNSEEN' as const };
        const correct = existing.correct + (firstTryCorrect ? 1 : 0);
        const wrong = existing.wrong + (firstTryCorrect ? 0 : 1);
        const total = correct + wrong;
        const accuracy = total > 0 ? correct / total : 0;
        const mastery = accuracy < 0.3 ? 'STRUGGLING' : accuracy < 0.7 ? 'LEARNING' : 'MASTERED';
        wordStats[questionText] = { wordKey: questionText, correct, wrong, mastery };
      }
      set({ wordStats });
    }

    set({ profiles, currentProfile: profile });
  },

  clearCurrentProfile: () => set({ currentProfile: null, wordStats: {} }),

  clearProfiles: () => {
    set({ profiles: {}, currentProfile: null, isServerBacked: false, wordStats: {} });
  },
}));

export { AVATARS, AVATAR_COLORS };
