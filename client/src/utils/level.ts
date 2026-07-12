import { Level } from '../types/game';

// Filters items to the child's level. Falls back to Intermediate when nothing
// matches yet (Beginner/Advanced content hasn't been authored for every set).
export function filterByLevel<T extends { level?: Level }>(items: T[], level: Level): T[] {
  const matched = items.filter((item) => (item.level ?? 'INTERMEDIATE') === level);
  if (matched.length > 0) return matched;
  return items.filter((item) => (item.level ?? 'INTERMEDIATE') === 'INTERMEDIATE');
}
