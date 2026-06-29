import api from './api';

export async function fetchContent() {
  const { data } = await api.get('/content');
  return data;
}
