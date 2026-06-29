import api from './api';

export async function getSummary(profileId: string) {
  const { data } = await api.get(`/stats/${profileId}/summary`);
  return data;
}

export async function getWordStats(profileId: string) {
  const { data } = await api.get(`/stats/${profileId}/words`);
  return data;
}
