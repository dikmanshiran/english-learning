import { useCallback } from 'react';
import { Question, VocabItem, PhraseItem, SentenceItem, ListenItem } from '../types/game';
import { VOCAB, PHRASES, LISTEN_SENTENCES } from '../data/content';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeVocabQ(item: VocabItem, type: 'e2h' | 'h2e'): Question {
  const allH = VOCAB.map((v) => v.h);
  const allE = VOCAB.map((v) => v.e);
  if (type === 'e2h') {
    const wrong = shuffle(allH.filter((h) => h !== item.h)).slice(0, 3);
    return { kind: 'e2h', question: item.e, answer: item.h, options: shuffle([item.h, ...wrong]), hintText: '' };
  } else {
    const wrong = shuffle(allE.filter((e) => e !== item.e)).slice(0, 3);
    return { kind: 'h2e', question: item.h, answer: item.e, options: shuffle([item.e, ...wrong]), hintText: '' };
  }
}

function makePhraseQ(item: PhraseItem, type: 'e2h' | 'h2e'): Question {
  const allH = PHRASES.map((p) => p.h);
  const allE = PHRASES.map((p) => p.e);
  if (type === 'e2h') {
    const wrong = shuffle(allH.filter((h) => h !== item.h)).slice(0, 3);
    return { kind: 'e2h', question: item.e, answer: item.h, options: shuffle([item.h, ...wrong]), hintText: 'phrase' };
  } else {
    const wrong = shuffle(allE.filter((e) => e !== item.e)).slice(0, 3);
    return { kind: 'h2e', question: item.h, answer: item.e, options: shuffle([item.e, ...wrong]), hintText: 'phrase' };
  }
}

function makeSentenceQ(item: SentenceItem): Question {
  return {
    kind: 'sentence',
    question: item.s,
    answer: item.a,
    options: shuffle(item.opts),
    hintText: 'Complete the sentence',
  };
}

function makeListenQ(item: VocabItem | PhraseItem | ListenItem): Question {
  const isSentence = LISTEN_SENTENCES.some((s) => s.e === (item as ListenItem).e);
  const isPhrase = PHRASES.some((p) => p.e === (item as PhraseItem).e);
  const wrongPool = isSentence ? LISTEN_SENTENCES : isPhrase ? PHRASES : VOCAB;
  const wrong = shuffle(wrongPool.filter((v) => v.h !== item.h)).slice(0, 3).map((v) => v.h);
  return {
    kind: 'listen',
    question: (item as ListenItem).e,
    answer: item.h,
    options: shuffle([item.h, ...wrong]),
    hintText: '',
  };
}

interface Pool {
  vocab: VocabItem[];
  phrases: PhraseItem[];
  sentences: SentenceItem[];
  listenItems: ListenItem[];
}

export function useBuildQuestions() {
  return useCallback((pool: Pool, questionCount: number, selectedUnits: Array<number | 'all'>): Question[] => {
    const qs: Question[] = [];
    const n = questionCount;
    const nSentence = Math.round(n * 0.15);
    const nListen = Math.round(n * 0.20);
    const nPhrase = Math.round(n * 0.15);
    const nVocab = n - nSentence - nListen - nPhrase;
    const nE2H = Math.round(nVocab * 0.55);
    const nH2E = nVocab - nE2H;
    const nPhraseE2H = Math.round(nPhrase * 0.5);
    const nPhraseH2E = nPhrase - nPhraseE2H;

    const vocabItems = shuffle(pool.vocab);
    vocabItems.slice(0, nE2H).forEach((v) => qs.push(makeVocabQ(v, 'e2h')));
    vocabItems.slice(nE2H, nE2H + nH2E).forEach((v) => qs.push(makeVocabQ(v, 'h2e')));

    const phraseItems = shuffle(pool.phrases);
    phraseItems.slice(0, nPhraseE2H).forEach((p) => qs.push(makePhraseQ(p, 'e2h')));
    phraseItems.slice(nPhraseE2H, nPhraseE2H + nPhraseH2E).forEach((p) => qs.push(makePhraseQ(p, 'h2e')));

    const sentItems = shuffle(pool.sentences);
    sentItems.slice(0, nSentence).forEach((s) => qs.push(makeSentenceQ(s)));

    // listen: half sentences, half words/phrases
    const listenSents = selectedUnits.includes('all')
      ? LISTEN_SENTENCES
      : LISTEN_SENTENCES.filter((s) =>
          (selectedUnits.filter((u) => u !== 'all') as number[]).includes(s.u)
        );
    const nListenSents = Math.max(1, Math.floor(nListen / 2));
    const nListenWords = nListen - nListenSents;
    shuffle(listenSents).slice(0, nListenSents).forEach((item) => qs.push(makeListenQ(item)));
    shuffle([...pool.vocab, ...pool.phrases]).slice(0, nListenWords).forEach((item) => qs.push(makeListenQ(item)));

    return shuffle(qs).slice(0, n);
  }, []);
}

// Web Audio tone
export function playTone(correct: boolean) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (correct) {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // audio not available
  }
}

// TTS
const PREFERRED_VOICE_NAMES = [
  'Samantha',        // macOS/iOS – clear American accent
  'Google US English', // Chrome on Android/desktop
  'Microsoft Zira',  // Windows
  'Karen',           // macOS Australian – very clear
];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICE_NAMES) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // fallback: any en-US voice
  return voices.find(v => v.lang === 'en-US') ?? null;
}

export function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.7;
  utt.pitch = 1.0;
  const voice = pickVoice();
  if (voice) utt.voice = voice;
  if (onEnd) utt.onend = onEnd;
  // voices may load async on first call
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.onvoiceschanged = null;
      const v = pickVoice();
      if (v) utt.voice = v;
      speechSynthesis.speak(utt);
    };
  } else {
    speechSynthesis.speak(utt);
  }
}
