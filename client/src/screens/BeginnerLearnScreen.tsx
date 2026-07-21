import { useEffect, useState } from 'react';
import { VocabItem } from '../types/game';
import { speak } from '../hooks/useGame';

interface BeginnerLearnScreenProps {
  words: VocabItem[];
  onComplete: () => void;
  onHome: () => void;
}

export function BeginnerLearnScreen({ words, onComplete, onHome }: BeginnerLearnScreenProps) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const word = words[idx];
  const isLast = idx + 1 >= words.length;

  useEffect(() => {
    if (!word) return;
    const timer = setTimeout(() => triggerSpeak(), 400);
    return () => clearTimeout(timer);
  }, [idx, word?.e]);

  function triggerSpeak() {
    if (!word) return;
    setPlaying(true);
    speak(word.e, () => setPlaying(false));
  }

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setIdx((i) => i + 1);
    }
  }

  if (!word) return null;

  const pct = words.length > 0 ? ((idx + 1) / words.length) * 100 : 0;

  return (
    <div className="screen active">
      <div className="game-header">
        <button className="back-btn" onClick={onHome}>
          ← Home
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">
        Word {idx + 1} of {words.length}
      </div>

      <div className="question-card">
        <div className="q-type-badge">📖 Learn a New Word · למד מילה חדשה</div>
        <div className="q-word">{word.e}</div>
        <div className="q-word hebrew" lang="he">{word.h}</div>
        <button className={`listen-btn${playing ? ' playing' : ''}`} onClick={triggerSpeak} style={{ marginTop: '14px' }}>
          🔊 Hear it in English · שמע באנגלית
        </button>
      </div>

      <button className="next-btn show" onClick={handleNext}>
        {isLast ? 'Start Quiz →' : 'Next ➜'}
      </button>
    </div>
  );
}
