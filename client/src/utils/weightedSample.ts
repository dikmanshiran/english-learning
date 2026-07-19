import { WordStat } from '../store/profileStore';

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Returns a weight multiplier based on past performance — struggling words
// come up more often, mastered ones less.
export function getWeight(key: string, wordStats: Record<string, WordStat>): number {
  const stat = wordStats[key];
  if (!stat || stat.mastery === 'UNSEEN') return 1.0;
  if (stat.mastery === 'STRUGGLING') return 4.0;
  if (stat.mastery === 'LEARNING') return 2.0;
  return 0.5; // MASTERED — still show occasionally
}

// Weighted random sample of `count` items from `arr`, without replacement.
export function weightedSample<T>(
  arr: T[],
  count: number,
  getKey: (item: T) => string,
  wordStats: Record<string, WordStat>
): T[] {
  if (arr.length === 0) return [];
  const weights = arr.map((item) => getWeight(getKey(item), wordStats));
  const result: T[] = [];
  const available = [...arr];
  const availableWeights = [...weights];

  for (let i = 0; i < Math.min(count, arr.length); i++) {
    const total = availableWeights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let j = 0; j < availableWeights.length; j++) {
      r -= availableWeights[j];
      if (r <= 0) { idx = j; break; }
    }
    result.push(available[idx]);
    available.splice(idx, 1);
    availableWeights.splice(idx, 1);
  }
  return result;
}
