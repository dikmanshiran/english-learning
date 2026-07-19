import { useState, useCallback } from 'react';
import { BOOK_EXERCISES, BookExercise } from '../data/bookExercises';
import { useProfileStore } from '../store/profileStore';
import { useGameStore } from '../store/gameStore';
import { playTone } from '../hooks/useGame';
import { filterByLevel } from '../utils/level';
import { shuffle, weightedSample } from '../utils/weightedSample';

// ── Hebrew instruction translations ────────────────────────────────────────

const INSTRUCTION_HE: Record<string, string> = {
  'Read and decide: True or False?':               'קרא והחלט: נכון או לא נכון?',
  'Read and answer the question.':                 'קרא וענה על השאלה.',
  'Read the clues and find the animal.':           'קרא את הרמזים ומצא את החיה.',
  'Which word does NOT belong?':                   'איזו מילה לא שייכת לקבוצה?',
  'What does this word mean? Choose the correct answer.': 'מה המשמעות של המילה? בחר את התשובה הנכונה.',
  'Choose the correct word to complete the sentence.':    'בחר את המילה הנכונה להשלמת המשפט.',
  'Choose the correct season.':                    'בחר את העונה הנכונה.',
  'Put the words in the correct order.':           'סדר את המילים בסדר הנכון.',
  'Choose the correct preposition.':               'בחר את מילת היחס הנכונה.',
  'Read and answer.':                              'קרא וענה.',
  'Read and circle the correct answer.':           'קרא והקף את התשובה הנכונה.',
  'Read the description. Which animal is it?':     'קרא את התיאור. איזו חיה זו?',
  'Read and choose the correct answer.':           'קרא ובחר את התשובה הנכונה.',
  'Read about pandas and answer.':                 'קרא על הפנדות וענה.',
  'Read the letter and answer.':                   'קרא את המכתב וענה.',
  'Read the postcard and answer.':                 'קרא את הגלויה וענה.',
  'Read the story and answer.':                    'קרא את הסיפור וענה.',
  'Choose "a" or "an".':                          '.בחר "a" או "an"',
};

// ── Exercise props ─────────────────────────────────────────────────────────
// onFirstWrong: called once when the child gets it wrong the first time (for scoring)
// onCorrect:    called when the child eventually answers correctly (advance)

interface ExerciseProps {
  exercise: BookExercise;
  onFirstWrong: () => void;
  onCorrect: () => void;
}

// ── Multiple choice ────────────────────────────────────────────────────────

function MultipleChoiceExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [shuffledOptions] = useState(() => shuffle(exercise.options));

  function handleChoice(opt: string) {
    if (resetting || correctChoice) return;
    if (opt === exercise.answer) {
      playTone(true);
      setCorrectChoice(opt);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setWrongChoice(opt);
      setResetting(true);
      setTimeout(() => { setWrongChoice(null); setResetting(false); }, 800);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {shuffledOptions.map((opt) => {
        let bg = 'var(--color-surface-1)';
        let border = '2px solid transparent';
        if (opt === wrongChoice) { bg = 'rgba(239,68,68,0.25)'; border = '2px solid var(--color-danger)'; }
        if (opt === correctChoice) { bg = 'rgba(16,185,129,0.25)'; border = '2px solid var(--color-success)'; }
        return (
          <button key={opt} onClick={() => handleChoice(opt)} style={{
            padding: '14px 16px', borderRadius: '14px', border, background: bg,
            color: '#fff', fontSize: '1rem', textAlign: 'left',
            cursor: resetting || correctChoice ? 'default' : 'pointer',
            transition: 'background 0.2s, border 0.2s',
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── True / False ───────────────────────────────────────────────────────────

function TrueFalseExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);

  function handleChoice(opt: string) {
    if (resetting || correctChoice) return;
    if (opt === exercise.answer) {
      playTone(true);
      setCorrectChoice(opt);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setWrongChoice(opt);
      setResetting(true);
      setTimeout(() => { setWrongChoice(null); setResetting(false); }, 800);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {['True', 'False'].map((opt) => {
        const isWrong = opt === wrongChoice;
        const isCorrect = opt === correctChoice;
        return (
          <button key={opt} onClick={() => handleChoice(opt)} style={{
            flex: 1, padding: '18px', borderRadius: '14px',
            border: `2px solid ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-danger)' : 'rgba(255,255,255,0.15)'}`,
            background: isCorrect ? 'rgba(16,185,129,0.25)' : isWrong ? 'rgba(239,68,68,0.25)' : 'var(--color-surface-1)',
            color: '#fff', fontSize: '1.1rem', fontWeight: 700,
            cursor: resetting || correctChoice ? 'default' : 'pointer', transition: 'all 0.2s',
          }}>
            {opt === 'True' ? '✅ True' : '❌ False'}
          </button>
        );
      })}
    </div>
  );
}

// ── Fill blank ─────────────────────────────────────────────────────────────

function FillBlankExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [shuffledOptions] = useState(() => shuffle(exercise.options));
  const parts = exercise.question.split('___');

  function handleChoice(opt: string) {
    if (resetting || correctChoice) return;
    if (opt === exercise.answer) {
      playTone(true);
      setCorrectChoice(opt);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setWrongChoice(opt);
      setResetting(true);
      setTimeout(() => { setWrongChoice(null); setResetting(false); }, 800);
    }
  }

  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
        padding: '16px', marginBottom: '16px', fontSize: '1.05rem', lineHeight: 1.7,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block', minWidth: '80px', borderBottom: `2px solid ${correctChoice ? 'var(--color-success)' : 'var(--color-accent)'}`,
          textAlign: 'center', color: correctChoice ? 'var(--color-success)' : 'var(--text-dim)', margin: '0 4px',
          transition: 'all 0.2s',
        }}>
          {correctChoice || '___'}
        </span>
        {parts[1]}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shuffledOptions.map((opt) => {
          const isWrong = opt === wrongChoice;
          const isCorrect = opt === correctChoice;
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              padding: '12px 16px', borderRadius: '12px',
              border: `2px solid ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-danger)' : 'transparent'}`,
              background: isCorrect ? 'rgba(16,185,129,0.25)' : isWrong ? 'rgba(239,68,68,0.25)' : 'var(--color-surface-1)',
              color: '#fff', fontSize: '0.95rem', textAlign: 'left',
              cursor: resetting || correctChoice ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Odd one out ────────────────────────────────────────────────────────────

function OddOneOutExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);

  function handleChoice(opt: string) {
    if (resetting || correctChoice) return;
    if (opt === exercise.answer) {
      playTone(true);
      setCorrectChoice(opt);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setWrongChoice(opt);
      setResetting(true);
      setTimeout(() => { setWrongChoice(null); setResetting(false); }, 800);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {exercise.options.map((opt) => {
        const isWrong = opt === wrongChoice;
        const isCorrect = opt === correctChoice;
        return (
          <button key={opt} onClick={() => handleChoice(opt)} style={{
            padding: '16px', borderRadius: '14px',
            border: `2px solid ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-danger)' : 'transparent'}`,
            background: isCorrect ? 'rgba(16,185,129,0.25)' : isWrong ? 'rgba(239,68,68,0.25)' : 'var(--color-surface-1)',
            color: '#fff', fontSize: '1rem', fontWeight: 600,
            cursor: resetting || correctChoice ? 'default' : 'pointer', transition: 'all 0.2s',
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── A / An ─────────────────────────────────────────────────────────────────

function AAnExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const word = exercise.question.replace('___ ', '');

  function handleChoice(opt: string) {
    if (resetting || correctChoice) return;
    if (opt === exercise.answer) {
      playTone(true);
      setCorrectChoice(opt);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setWrongChoice(opt);
      setResetting(true);
      setTimeout(() => { setWrongChoice(null); setResetting(false); }, 800);
    }
  }

  return (
    <div>
      <div style={{
        textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
        marginBottom: '24px', color: correctChoice ? 'var(--color-success)' : 'var(--color-accent)',
        transition: 'color 0.2s',
      }}>
        {correctChoice ? `${correctChoice} ${word}` : `___ ${word}`}
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        {['a', 'an'].map((opt) => {
          const isWrong = opt === wrongChoice;
          const isCorrect = opt === correctChoice;
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              flex: 1, padding: '20px', borderRadius: '16px',
              border: `2px solid ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-danger)' : 'rgba(255,255,255,0.2)'}`,
              background: isCorrect ? 'rgba(16,185,129,0.25)' : isWrong ? 'rgba(239,68,68,0.25)' : 'var(--color-surface-1)',
              color: '#fff', fontSize: '1.5rem', fontWeight: 700,
              cursor: resetting || correctChoice ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Word order ─────────────────────────────────────────────────────────────

function WordOrderExercise({ exercise, onFirstWrong, onCorrect }: ExerciseProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(() => shuffle(exercise.options));
  const [shake, setShake] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [firstTry, setFirstTry] = useState(true);

  function addWord(word: string, idx: number) {
    if (resetting) return;
    setChosen((prev) => [...prev, word]);
    setRemaining((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function removeWord(word: string, idx: number) {
    if (resetting) return;
    setRemaining((prev) => [...prev, word]);
    setChosen((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function handleCheck() {
    if (resetting || chosen.length === 0) return;
    const attempt = chosen.join(' ');
    if (attempt === exercise.answer) {
      playTone(true);
      setIsCorrect(true);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry) { onFirstWrong(); setFirstTry(false); }
      playTone(false);
      setShake(true);
      setResetting(true);
      setTimeout(() => {
        setChosen([]);
        setRemaining(shuffle(exercise.options));
        setShake(false);
        setResetting(false);
      }, 800);
    }
  }

  return (
    <div>
      {/* Answer area */}
      <div style={{
        minHeight: '56px', borderRadius: '14px', padding: '12px 14px',
        border: `2px solid ${shake ? 'var(--color-danger)' : 'rgba(255,255,255,0.2)'}`,
        background: shake ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
        display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px',
        transition: 'border 0.2s, background 0.2s',
      }}>
        {chosen.length === 0 && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Tap words below to build the sentence</span>
        )}
        {chosen.map((w, i) => (
          <span key={i} onClick={() => removeWord(w, i)} style={{
            background: 'var(--color-primary)', borderRadius: '8px', padding: '4px 10px',
            fontSize: '0.95rem', cursor: resetting ? 'default' : 'pointer',
          }}>
            {w}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {remaining.map((w, i) => (
          <button key={i} onClick={() => addWord(w, i)} disabled={resetting} style={{
            background: 'var(--color-surface-1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '0.95rem',
            cursor: resetting ? 'default' : 'pointer', opacity: resetting ? 0.5 : 1,
          }}>
            {w}
          </button>
        ))}
      </div>

      <button onClick={handleCheck} disabled={chosen.length === 0 || resetting} style={{
        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
        background: chosen.length === 0 ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)',
        color: '#fff', fontSize: '1rem', fontWeight: 700,
        cursor: chosen.length === 0 ? 'not-allowed' : 'pointer',
        opacity: chosen.length === 0 || resetting ? 0.5 : 1,
      }}>
        Check ✓
      </button>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

interface ExercisesScreenProps {
  onHome: () => void;
  onResults: (score: number, total: number) => void;
}

export function ExercisesScreen({ onHome, onResults }: ExercisesScreenProps) {
  const { wordStats, currentProfile, updateProfileStats } = useProfileStore();
  const { questionCount } = useGameStore();
  const [exercises] = useState<BookExercise[]>(() =>
    weightedSample(filterByLevel(BOOK_EXERCISES, currentProfile?.level ?? 'INTERMEDIATE'), questionCount, (e) => e.id, wordStats)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ id: string; firstTryCorrect: boolean }[]>([]);

  const current = exercises[currentIdx];

  // We need to track per-question whether first try was correct.
  // We pass two callbacks: onFirstWrong (to record it was wrong) and onCorrect.
  // Each exercise tracks firstTry internally and calls onFirstWrong once.
  // onCorrect gets called when finally correct — we need to know if it was first try.
  // Solution: each exercise calls onFirstWrong if wrong, then onCorrect when right.
  // The screen knows: if onFirstWrong was called → not first try.

  const [firstTryCorrectForCurrent, setFirstTryCorrectForCurrent] = useState(true);

  const handleFirstWrongCurrent = useCallback(() => {
    setFirstTryCorrectForCurrent(false);
  }, []);

  const handleCorrectCurrent = useCallback(() => {
    const wasFirstTry = firstTryCorrectForCurrent;
    if (wasFirstTry) setScore((s) => s + 1);

    const newResults = [...results, { id: current.id, firstTryCorrect: wasFirstTry }];
    setResults(newResults);

    if (currentIdx + 1 >= exercises.length) {
      if (currentProfile) {
        updateProfileStats(
          currentProfile.id,
          0,
          newResults.map((r) => ({ questionText: r.id, firstTryCorrect: r.firstTryCorrect }))
        );
      }
      onResults(score + (wasFirstTry ? 1 : 0), exercises.length);
    } else {
      setFirstTryCorrectForCurrent(true); // reset for next question
      setCurrentIdx((i) => i + 1);
    }
  }, [firstTryCorrectForCurrent, results, current, currentIdx, exercises, score, currentProfile, updateProfileStats, onResults]);

  if (!current) return null;

  const progress = (currentIdx / exercises.length) * 100;

  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onHome} style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px',
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              {currentIdx + 1} / {exercises.length}
            </span>
            <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>
              ⭐ {score}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <div style={{
              height: '100%', background: 'var(--color-primary)',
              borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Topic chip */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          background: 'rgba(108,63,197,0.3)', borderRadius: '20px',
          padding: '4px 12px', fontSize: '0.78rem', color: 'var(--color-primary)',
          border: '1px solid rgba(108,63,197,0.4)',
        }}>
          📚 {current.topic}
        </span>
      </div>

      {/* Instruction — English + Hebrew */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
          {current.instruction}
        </div>
        {INSTRUCTION_HE[current.instruction] && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', direction: 'rtl', marginTop: '2px' }}>
            {INSTRUCTION_HE[current.instruction]}
          </div>
        )}
      </div>

      {/* Reading passage */}
      {current.passage && (
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: '14px',
          padding: '14px', marginBottom: '14px', fontSize: '0.88rem',
          lineHeight: 1.7, color: 'rgba(255,255,255,0.85)',
          maxHeight: '160px', overflowY: 'auto',
          borderLeft: '3px solid var(--color-primary)',
        }}>
          {current.passage}
        </div>
      )}

      {/* Question — fill-blank renders its own sentence internally, so skip here */}
      {current.question && current.type !== 'fill-blank' && (
        <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '18px', lineHeight: 1.5 }}>
          {current.type === 'odd-one-out'
            ? `Which word does NOT belong in the group: "${current.question}"?`
            : current.question}
        </div>
      )}

      {/* Exercise — key forces remount on question change */}
      <div style={{ flex: 1 }}>
        {current.type === 'multiple-choice' && (
          <MultipleChoiceExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
        {current.type === 'true-false' && (
          <TrueFalseExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
        {current.type === 'fill-blank' && (
          <FillBlankExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
        {current.type === 'odd-one-out' && (
          <OddOneOutExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
        {current.type === 'a-an' && (
          <AAnExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
        {current.type === 'word-order' && (
          <WordOrderExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} />
        )}
      </div>
    </div>
  );
}
