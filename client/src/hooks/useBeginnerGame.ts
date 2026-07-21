import { useCallback } from 'react';
import { Question, LetterItem, VocabItem, FIRST_WORDS_UNIT_ID } from '../types/game';
import { LETTERS } from '../data/letters';
import { VOCAB } from '../data/content';
import { WordStat } from '../store/profileStore';
import { shuffle, weightedSample } from '../utils/weightedSample';

// `getKey` below picks one canonical key per item (e.g. the uppercase letter)
// even though the rendered question text — and therefore the stat actually
// recorded — varies by question variant; that's the same approximation the
// regular vocab builder in useGame.ts already makes for e2h vs h2e.

// ── Letters folder: case-flip + listen-and-choose-the-letter ───────────────

type CaseVariant = 'upper' | 'lower';

function makeLetterCaseFlipQuestion(item: LetterItem, variant: 'upper2lower' | 'lower2upper'): Question {
  if (variant === 'upper2lower') {
    const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map((l) => l.lower);
    return {
      kind: 'letter-choice',
      question: item.letter,
      answer: item.lower,
      options: shuffle([item.lower, ...wrong]),
      hintText: 'Which lowercase letter matches? · איזו אות קטנה מתאימה?',
    };
  }
  const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map((l) => l.letter);
  return {
    kind: 'letter-choice',
    question: item.lower,
    answer: item.letter,
    options: shuffle([item.letter, ...wrong]),
    hintText: 'Which UPPERCASE letter matches? · איזו אות גדולה מתאימה?',
  };
}

function makeLetterListenQuestion(item: LetterItem, caseVariant: CaseVariant): Question {
  const pick = (l: LetterItem) => (caseVariant === 'upper' ? l.letter : l.lower);
  const wrong = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 3).map(pick);
  return {
    kind: 'letter-listen',
    question: item.word,
    answer: pick(item),
    options: shuffle([pick(item), ...wrong]),
    hintText: 'Which letter does this word start with? · באיזו אות מתחילה המילה?',
  };
}

export function useBuildLetterQuestions() {
  return useCallback((count: number, wordStats: Record<string, WordStat> = {}): Question[] => {
    const qs: Question[] = [];
    const nListen = Math.max(1, Math.round(count * 0.5));
    const nCaseFlip = count - nListen;
    const caseFlipVariants: Array<'upper2lower' | 'lower2upper'> = ['upper2lower', 'lower2upper'];
    const getKey = (l: LetterItem) => l.letter;

    weightedSample(LETTERS, nListen, getKey, wordStats).forEach((item) =>
      qs.push(makeLetterListenQuestion(item, Math.random() < 0.5 ? 'upper' : 'lower'))
    );
    weightedSample(LETTERS, nCaseFlip, getKey, wordStats).forEach((item, i) =>
      qs.push(makeLetterCaseFlipQuestion(item, caseFlipVariants[i % caseFlipVariants.length]))
    );

    return shuffle(qs).slice(0, count);
  }, []);
}

// ── First Words folder: teach a batch, then quiz on it ─────────────────────

const BEGINNER_VOCAB = VOCAB.filter((v) => v.u === FIRST_WORDS_UNIT_ID);

export function useBuildBeginnerBatch() {
  return useCallback((count: number, wordStats: Record<string, WordStat> = {}): VocabItem[] => {
    return weightedSample(BEGINNER_VOCAB, count, (v) => v.e, wordStats);
  }, []);
}

function makeBeginnerVocabQ(item: VocabItem, kind: 'e2h' | 'h2e' | 'listen'): Question {
  if (kind === 'e2h') {
    const wrong = shuffle(BEGINNER_VOCAB.filter((v) => v.h !== item.h)).slice(0, 3).map((v) => v.h);
    return { kind: 'e2h', question: item.e, answer: item.h, options: shuffle([item.h, ...wrong]), hintText: '' };
  }
  if (kind === 'h2e') {
    const wrong = shuffle(BEGINNER_VOCAB.filter((v) => v.e !== item.e)).slice(0, 3).map((v) => v.e);
    return { kind: 'h2e', question: item.h, answer: item.e, options: shuffle([item.e, ...wrong]), hintText: '' };
  }
  const wrong = shuffle(BEGINNER_VOCAB.filter((v) => v.h !== item.h)).slice(0, 3).map((v) => v.h);
  return { kind: 'listen', question: item.e, answer: item.h, options: shuffle([item.h, ...wrong]), hintText: '' };
}

export function useBuildFirstWordsQuestions() {
  return useCallback((batch: VocabItem[], wordStats: Record<string, WordStat> = {}): Question[] => {
    type Pair = { item: VocabItem; kind: 'e2h' | 'h2e' | 'listen' };
    const candidates: Pair[] = [];
    batch.forEach((item) => {
      candidates.push({ item, kind: 'e2h' });
      candidates.push({ item, kind: 'h2e' });
      candidates.push({ item, kind: 'listen' });
    });

    const picked = weightedSample(candidates, batch.length, (p) => p.item.e, wordStats);
    return shuffle(picked.map((p) => makeBeginnerVocabQ(p.item, p.kind)));
  }, []);
}
