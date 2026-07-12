import api from './api';
import { UserProfile, Level } from '../types/game';

export interface ServerProfile {
  id: string;
  parentId: string;
  name: string;
  avatar: string;
  color: string;
  level: Level;
  totalGames: number;
  totalStars: number;
}

function toUserProfile(p: ServerProfile): UserProfile {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    level: p.level ?? 'INTERMEDIATE',
    totalGames: p.totalGames,
    totalStars: p.totalStars,
    stats: {},
    parentId: p.parentId,
  };
}

export async function fetchProfiles(): Promise<UserProfile[]> {
  const { data } = await api.get('/profiles');
  return (data as ServerProfile[]).map(toUserProfile);
}

export async function createProfile(name: string, avatar: string, color: string, level: Level = 'INTERMEDIATE'): Promise<UserProfile> {
  const { data } = await api.post('/profiles', { name, avatar, color, level });
  return toUserProfile(data as ServerProfile);
}

export async function updateProfile(id: string, fields: Partial<{ name: string; avatar: string; color: string; level: Level }>): Promise<UserProfile> {
  const { data } = await api.patch(`/profiles/${id}`, fields);
  return toUserProfile(data as ServerProfile);
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`/profiles/${id}`);
}
