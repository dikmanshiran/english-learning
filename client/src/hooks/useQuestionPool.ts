import { useMemo } from 'react';
import { useContentStore } from '../store/contentStore';
import { VocabItem, PhraseItem, SentenceItem, ListenItem, Level } from '../types/game';
import { filterByLevel } from '../utils/level';

export function useQuestionPool(selectedUnits: Array<number | 'all'>, level: Level) {
  const { vocab, phrases, sentences, listenItems } = useContentStore();

  return useMemo(() => {
    const byUnit = selectedUnits.includes('all')
      ? { vocab, phrases, sentences, listenItems }
      : (() => {
          const units = selectedUnits.filter((u) => u !== 'all') as number[];
          return {
            vocab: vocab.filter((v: VocabItem) => units.includes(v.u)),
            phrases: phrases.filter((p: PhraseItem) => units.includes(p.u)),
            sentences: sentences.filter((s: SentenceItem) => units.includes(s.u)),
            listenItems: listenItems.filter((l: ListenItem) => units.includes(l.u)),
          };
        })();

    return {
      vocab: filterByLevel(byUnit.vocab, level),
      phrases: filterByLevel(byUnit.phrases, level),
      sentences: filterByLevel(byUnit.sentences, level),
      listenItems: filterByLevel(byUnit.listenItems, level),
    };
  }, [selectedUnits, level, vocab, phrases, sentences, listenItems]);
}
