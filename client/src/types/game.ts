export type QuestionKind = 'e2h' | 'h2e' | 'sentence' | 'listen' | 'letter-choice' | 'letter-listen';
export type MasteryLevel = 'UNSEEN' | 'STRUGGLING' | 'LEARNING' | 'MASTERED';
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// Beginner-only folder unit ids — see UNITS below.
export const LETTERS_UNIT_ID = 101;
export const FIRST_WORDS_UNIT_ID = 102;

export const LEVELS: { id: Level; label: string; labelHe: string; icon: string }[] = [
  { id: 'BEGINNER', label: 'Beginner', labelHe: 'מתחיל', icon: '🌱' },
  { id: 'INTERMEDIATE', label: 'Intermediate', labelHe: 'בינוני', icon: '🌿' },
  { id: 'ADVANCED', label: 'Advanced', labelHe: 'מתקדם', icon: '🌳' },
];

export interface VocabItem {
  e: string;
  h: string;
  u: number;
  level: Level;
}

export interface PhraseItem {
  e: string;
  h: string;
  u: number;
  level: Level;
}

export interface SentenceItem {
  s: string;
  a: string;
  opts: string[];
  u: number;
  level: Level;
}

export interface ListenItem {
  e: string;
  h: string;
  u: number;
  level: Level;
}

export interface LetterItem {
  letter: string;  // uppercase form, e.g. 'A'
  lower: string;   // lowercase form, e.g. 'a'
  word: string;    // example word starting with the letter, e.g. 'Apple'
  emoji: string;
  hebrew: string;  // Hebrew translation of the example word
  level: Level;
}

export interface Question {
  kind: QuestionKind;
  question: string;
  answer: string;
  options: string[];
  hintText: string;
  _wrongLogged?: boolean;
}

export interface WrongAnswer {
  q: Question;
  chosen: string;
  correct: string;
}

export interface QuestionLogEntry {
  q: Question;
  firstTryCorrect: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  level: Level;
  totalGames: number;
  totalStars: number;
  stats: Record<string, { correct: number; wrong: number; lastSeen: number }>;
  // server sync
  serverId?: string;
  parentId?: string;
}

export interface Unit {
  id: number;
  name: string;
  icon: string;
  level: Level;
}

export const AVATARS = ['🦁', '🐯', '🐧', '🦊', '🐸', '🐼', '🦄', '🐙', '🦋', '🦕'];
export const AVATAR_COLORS = [
  '#6c3fc5', '#e05252', '#2a9d8f', '#e76f51', '#457b9d',
  '#e9c46a', '#8338ec', '#06d6a0', '#fb5607', '#3a86ff',
];

export const UNITS: Unit[] = [
  { id: 1, name: 'At School', icon: '🏫', level: 'INTERMEDIATE' },
  { id: 2, name: "Let's Play", icon: '⚽', level: 'INTERMEDIATE' },
  { id: 3, name: 'Animals', icon: '🐘', level: 'INTERMEDIATE' },
  { id: 4, name: 'Be Careful!', icon: '⚠️', level: 'INTERMEDIATE' },
  { id: 5, name: 'Work Together', icon: '🤝', level: 'INTERMEDIATE' },
  { id: LETTERS_UNIT_ID, name: 'Letters', icon: '🔤', level: 'BEGINNER' },
  { id: FIRST_WORDS_UNIT_ID, name: 'First Words', icon: '⭐', level: 'BEGINNER' },
];
