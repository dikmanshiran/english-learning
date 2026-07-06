import api from './api';
import { UserProfile } from '../types/game';

export interface ServerProfile {
  id: string;
  parentId: string;
  name: string;
  avatar: string;
  color: string;
  totalGames: number;
  totalStars: number;
}

function toUserProfile(p: ServerProfile): UserProfile {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
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

export async function createProfile(name: string, avatar: string, color: string): Promise<UserProfile> {
  const { data } = await api.post('/profiles', { name, avatar, color });
  return toUserProfile(data as ServerProfile);
}

export async function updateProfile(id: string, fields: Partial<{ name: string; avatar: string; color: string }>): Promise<UserProfile> {
  const { data } = await api.patch(`/profiles/${id}`, fields);
  return toUserProfile(data as ServerProfile);
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`/profiles/${id}`);
}
