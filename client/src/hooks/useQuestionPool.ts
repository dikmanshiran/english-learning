import { useMemo } from 'react';
import { useContentStore } from '../store/contentStore';
import { VocabItem, PhraseItem, SentenceItem, ListenItem } from '../types/game';

export function useQuestionPool(selectedUnits: Array<number | 'all'>) {
  const { vocab, phrases, sentences, listenItems } = useContentStore();

  return useMemo(() => {
    if (selectedUnits.includes('all')) {
      return { vocab, phrases, sentences, listenItems };
    }
    const units = selectedUnits.filter((u) => u !== 'all') as number[];
    return {
      vocab: vocab.filter((v: VocabItem) => units.includes(v.u)),
      phrases: phrases.filter((p: PhraseItem) => units.includes(p.u)),
      sentences: sentences.filter((s: SentenceItem) => units.includes(s.u)),
      listenItems: listenItems.filter((l: ListenItem) => units.includes(l.u)),
    };
  }, [selectedUnits, vocab, phrases, sentences, listenItems]);
}
