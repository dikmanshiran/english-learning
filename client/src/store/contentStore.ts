import { create } from 'zustand';
import { VOCAB, PHRASES, SENTENCES, LISTEN_SENTENCES } from '../data/content';
import { VocabItem, PhraseItem, SentenceItem, ListenItem } from '../types/game';

interface ContentState {
  vocab: VocabItem[];
  phrases: PhraseItem[];
  sentences: SentenceItem[];
  listenItems: ListenItem[];
}

// Content is bundled; no remote fetch needed for now
export const useContentStore = create<ContentState>(() => ({
  vocab: VOCAB,
  phrases: PHRASES,
  sentences: SENTENCES,
  listenItems: LISTEN_SENTENCES,
}));
