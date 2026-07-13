import { useCallback } from 'react';
import { Question, LetterItem, VocabItem, FIRST_WORDS_UNIT_ID } from '../types/game';
import { LETTERS } from '../data/letters';
import { VOCAB } from '../data/content';
import { WordStat } from '../store/profileStore';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Same weighting as useGame.ts's useBuildQuestions — struggling words come up
// more often, mastered ones less. `getKey` picks one canonical key per item
// (e.g. the uppercase letter) even though the rendered question text — and
// therefore the stat actually recorded — varies by question variant; that's
// the same approximation the regular vocab builder already makes.
function getWeight(key: string, wordStats: Record<string, WordStat>): number {
  const stat = wordStats[key];
  if (!stat || stat.mastery === 'UNSEEN') return 1.0;
  if (stat.mastery === 'STRUGGLING') return 4.0;
  if (stat.mastery === 'LEARNING') return 2.0;
  return 0.5;
}

function weightedSample<T>(
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

// ── Letters folder: recognition ("read") + typing ("write") ────────────────

type LetterVariant = 'upper2lower' | 'lower2upper' | 'word2letter';

function makeLetterChoiceQuestion(item: LetterItem, variant: LetterVariant): Question {
  if (variant === 'upper2lower') {
    const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map((l) => l.lower);
    return {
      kind: 'letter-choice',
      question: item.letter,
      answer: item.lower,
      options: shuffle([item.lower, ...wrong]),
      hintText: 'Which lowercase letter matches?',
    };
  }
  if (variant === 'lower2upper') {
    const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map((l) => l.letter);
    return {
      kind: 'letter-choice',
      question: item.lower,
      answer: item.letter,
      options: shuffle([item.letter, ...wrong]),
      hintText: 'Which UPPERCASE letter matches?',
    };
  }
  // word2letter
  const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map((l) => l.letter);
  return {
    kind: 'letter-choice',
    question: `${item.emoji} ${item.word}`,
    answer: item.letter,
    options: shuffle([item.letter, ...wrong]),
    hintText: 'Which letter does this start with?',
  };
}

function makeLetterTypeQuestion(item: LetterItem): Question {
  return {
    kind: 'letter-type',
    question: `${item.emoji} ${item.word}`,
    answer: item.letter,
    options: [],
    hintText: 'Type the first letter (UPPERCASE)',
  };
}

export function useBuildLetterQuestions() {
  return useCallback((count: number, wordStats: Record<string, WordStat> = {}): Question[] => {
    const qs: Question[] = [];
    const nType = Math.max(1, Math.round(count * 0.5));
    const nChoice = count - nType;
    const variants: LetterVariant[] = ['upper2lower', 'lower2upper', 'word2letter'];
    const getKey = (l: LetterItem) => l.letter;

    weightedSample(LETTERS, nType, getKey, wordStats).forEach((item) => qs.push(makeLetterTypeQuestion(item)));
    weightedSample(LETTERS, nChoice, getKey, wordStats).forEach((item, i) =>
      qs.push(makeLetterChoiceQuestion(item, variants[i % variants.length]))
    );

    return shuffle(qs).slice(0, count);
  }, []);
}

// ── First Words folder: simple e2h/h2e only, beginner pool only ───────────

const BEGINNER_VOCAB = VOCAB.filter((v) => v.u === FIRST_WORDS_UNIT_ID);

function makeBeginnerVocabQ(item: VocabItem, type: 'e2h' | 'h2e'): Question {
  if (type === 'e2h') {
    const wrong = shuffle(BEGINNER_VOCAB.filter((v) => v.h !== item.h)).slice(0, 3).map((v) => v.h);
    return { kind: 'e2h', question: item.e, answer: item.h, options: shuffle([item.h, ...wrong]), hintText: '' };
  }
  const wrong = shuffle(BEGINNER_VOCAB.filter((v) => v.e !== item.e)).slice(0, 3).map((v) => v.e);
  return { kind: 'h2e', question: item.h, answer: item.e, options: shuffle([item.e, ...wrong]), hintText: '' };
}

export function useBuildFirstWordsQuestions() {
  return useCallback((count: number, wordStats: Record<string, WordStat> = {}): Question[] => {
    const qs: Question[] = [];
    const nE2H = Math.round(count * 0.5);
    const nH2E = count - nE2H;
    const getKey = (v: VocabItem) => v.e;

    weightedSample(BEGINNER_VOCAB, nE2H, getKey, wordStats).forEach((item) => qs.push(makeBeginnerVocabQ(item, 'e2h')));
    weightedSample(BEGINNER_VOCAB, nH2E, getKey, wordStats).forEach((item) => qs.push(makeBeginnerVocabQ(item, 'h2e')));

    return shuffle(qs).slice(0, count);
  }, []);
}
