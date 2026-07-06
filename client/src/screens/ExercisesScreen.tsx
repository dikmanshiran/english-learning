import { useState, useCallback } from 'react';
import { BOOK_EXERCISES, BookExercise } from '../data/bookExercises';
import { useProfileStore, WordStat } from '../store/profileStore';
import { playTone } from '../hooks/useGame';

const EXERCISE_COUNT = 10;

// ── Weighted sampling ──────────────────────────────────────────────────────

function getWeight(id: string, wordStats: Record<string, WordStat>): number {
  const stat = wordStats[id];
  if (!stat || stat.mastery === 'UNSEEN') return 1.0;
  if (stat.mastery === 'STRUGGLING') return 4.0;
  if (stat.mastery === 'LEARNING') return 2.0;
  return 0.5;
}

function weightedSample(exercises: BookExercise[], count: number, wordStats: Record<string, WordStat>): BookExercise[] {
  const weights = exercises.map((e) => getWeight(e.id, wordStats));
  const result: BookExercise[] = [];
  const pool = [...exercises];
  const poolWeights = [...weights];
  for (let i = 0; i < Math.min(count, exercises.length); i++) {
    const total = poolWeights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let j = 0; j < poolWeights.length; j++) {
      r -= poolWeights[j];
      if (r <= 0) { idx = j; break; }
    }
    result.push(pool[idx]);
    pool.splice(idx, 1);
    poolWeights.splice(idx, 1);
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Shared "Next" button shown after a wrong answer ───────────────────────

function NextButton({ onNext }: { onNext: () => void }) {
  return (
    <button
      onClick={onNext}
      style={{
        marginTop: '16px', width: '100%', padding: '14px',
        borderRadius: '14px', border: 'none',
        background: 'var(--color-primary)', color: '#fff',
        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
      }}
    >
      Next →
    </button>
  );
}

// ── Exercise props ─────────────────────────────────────────────────────────

interface ExerciseProps {
  exercise: BookExercise;
  onAnswer: (correct: boolean) => void;  // called immediately on selection
  onNext: () => void;                    // called to advance (auto on correct, manual on wrong)
}

// ── Multiple choice ────────────────────────────────────────────────────────

function MultipleChoiceExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [shuffledOptions] = useState(() => shuffle(exercise.options));

  function handleChoice(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === exercise.answer;
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 700);
  }

  const isWrong = chosen !== null && chosen !== exercise.answer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {shuffledOptions.map((opt) => {
        let bg = 'var(--color-surface-1)';
        let border = '2px solid transparent';
        if (chosen) {
          if (opt === exercise.answer) { bg = 'rgba(16,185,129,0.2)'; border = '2px solid var(--color-success)'; }
          else if (opt === chosen) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid var(--color-danger)'; }
        }
        return (
          <button key={opt} onClick={() => handleChoice(opt)} style={{
            padding: '14px 16px', borderRadius: '14px', border, background: bg,
            color: '#fff', fontSize: '1rem', textAlign: 'left',
            cursor: chosen ? 'default' : 'pointer', transition: 'background 0.2s, border 0.2s',
          }}>
            {opt}
          </button>
        );
      })}
      {isWrong && <NextButton onNext={onNext} />}
    </div>
  );
}

// ── True / False ───────────────────────────────────────────────────────────

function TrueFalseExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string | null>(null);

  function handleChoice(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === exercise.answer;
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 700);
  }

  const isWrong = chosen !== null && chosen !== exercise.answer;

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {['True', 'False'].map((opt) => {
          let bg = opt === 'True' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
          let border = `2px solid ${opt === 'True' ? 'var(--color-success)' : 'var(--color-danger)'}`;
          if (chosen && chosen !== opt) { bg = 'var(--color-surface-1)'; border = '2px solid transparent'; }
          if (chosen && opt === exercise.answer) { bg = 'rgba(16,185,129,0.3)'; border = '2px solid var(--color-success)'; }
          if (chosen && opt === chosen && opt !== exercise.answer) { bg = 'rgba(239,68,68,0.3)'; border = '2px solid var(--color-danger)'; }
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              flex: 1, padding: '18px', borderRadius: '14px', border, background: bg,
              color: '#fff', fontSize: '1.1rem', fontWeight: 700,
              cursor: chosen ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt === 'True' ? '✅ True' : '❌ False'}
            </button>
          );
        })}
      </div>
      {isWrong && <NextButton onNext={onNext} />}
    </div>
  );
}

// ── Fill blank ─────────────────────────────────────────────────────────────

function FillBlankExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [shuffledOptions] = useState(() => shuffle(exercise.options));
  const parts = exercise.question.split('___');

  function handleChoice(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === exercise.answer;
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 700);
  }

  const isWrong = chosen !== null && chosen !== exercise.answer;

  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
        padding: '16px', marginBottom: '16px', fontSize: '1.05rem', lineHeight: 1.7,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block', minWidth: '80px', borderBottom: '2px solid var(--color-accent)',
          textAlign: 'center', color: 'var(--color-accent)', margin: '0 4px',
        }}>
          {chosen || '___'}
        </span>
        {parts[1]}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shuffledOptions.map((opt) => {
          let bg = 'var(--color-surface-1)';
          let border = '2px solid transparent';
          if (chosen) {
            if (opt === exercise.answer) { bg = 'rgba(16,185,129,0.2)'; border = '2px solid var(--color-success)'; }
            else if (opt === chosen) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid var(--color-danger)'; }
          }
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              padding: '12px 16px', borderRadius: '12px', border, background: bg,
              color: '#fff', fontSize: '0.95rem', textAlign: 'left',
              cursor: chosen ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {isWrong && <NextButton onNext={onNext} />}
    </div>
  );
}

// ── Odd one out ────────────────────────────────────────────────────────────

function OddOneOutExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string | null>(null);

  function handleChoice(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === exercise.answer;
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 700);
  }

  const isWrong = chosen !== null && chosen !== exercise.answer;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {exercise.options.map((opt) => {
          let bg = 'var(--color-surface-1)';
          let border = '2px solid transparent';
          if (chosen) {
            if (opt === exercise.answer) { bg = 'rgba(16,185,129,0.2)'; border = '2px solid var(--color-success)'; }
            else if (opt === chosen) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid var(--color-danger)'; }
          }
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              padding: '16px', borderRadius: '14px', border, background: bg,
              color: '#fff', fontSize: '1rem', fontWeight: 600,
              cursor: chosen ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {isWrong && <NextButton onNext={onNext} />}
    </div>
  );
}

// ── A / An ─────────────────────────────────────────────────────────────────

function AAnExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const word = exercise.question.replace('___ ', '');

  function handleChoice(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === exercise.answer;
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 700);
  }

  const isWrong = chosen !== null && chosen !== exercise.answer;

  return (
    <div>
      <div style={{
        textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
        marginBottom: '24px', color: 'var(--color-accent)',
      }}>
        {chosen ? `${chosen} ${word}` : `___ ${word}`}
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        {['a', 'an'].map((opt) => {
          let bg = 'var(--color-surface-1)';
          let border = '2px solid rgba(255,255,255,0.2)';
          if (chosen) {
            if (opt === exercise.answer) { bg = 'rgba(16,185,129,0.2)'; border = '2px solid var(--color-success)'; }
            else if (opt === chosen) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid var(--color-danger)'; }
          }
          return (
            <button key={opt} onClick={() => handleChoice(opt)} style={{
              flex: 1, padding: '20px', borderRadius: '16px', border, background: bg,
              color: '#fff', fontSize: '1.5rem', fontWeight: 700,
              cursor: chosen ? 'default' : 'pointer', transition: 'all 0.2s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {isWrong && <NextButton onNext={onNext} />}
    </div>
  );
}

// ── Word order ─────────────────────────────────────────────────────────────

function WordOrderExercise({ exercise, onAnswer, onNext }: ExerciseProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(() => shuffle(exercise.options));
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function addWord(word: string, idx: number) {
    if (submitted) return;
    setChosen((prev) => [...prev, word]);
    setRemaining((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function removeWord(word: string, idx: number) {
    if (submitted) return;
    setRemaining((prev) => [...prev, word]);
    setChosen((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function handleCheck() {
    if (submitted || chosen.length === 0) return;
    setSubmitted(true);
    const attempt = chosen.join(' ');
    const correct = attempt === exercise.answer;
    setIsCorrect(correct);
    playTone(correct);
    onAnswer(correct);
    if (correct) setTimeout(onNext, 800);
  }

  const attempt = chosen.join(' ');
  const wrong = submitted && !isCorrect;

  return (
    <div>
      {/* Answer area */}
      <div style={{
        minHeight: '56px', borderRadius: '14px', padding: '12px 14px',
        border: `2px solid ${submitted ? (isCorrect ? 'var(--color-success)' : 'var(--color-danger)') : 'rgba(255,255,255,0.2)'}`,
        background: submitted ? (isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'rgba(255,255,255,0.04)',
        display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px',
      }}>
        {chosen.length === 0 && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Tap words below to build the sentence</span>
        )}
        {chosen.map((w, i) => (
          <span key={i} onClick={() => removeWord(w, i)} style={{
            background: 'var(--color-primary)', borderRadius: '8px', padding: '4px 10px',
            fontSize: '0.95rem', cursor: submitted ? 'default' : 'pointer',
          }}>
            {w}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {remaining.map((w, i) => (
          <button key={i} onClick={() => addWord(w, i)} disabled={submitted} style={{
            background: 'var(--color-surface-1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '0.95rem',
            cursor: 'pointer', opacity: submitted ? 0.5 : 1,
          }}>
            {w}
          </button>
        ))}
      </div>

      {/* Show correct answer when wrong */}
      {wrong && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid var(--color-success)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '8px',
          fontSize: '0.9rem', color: 'var(--color-success)',
        }}>
          ✓ Correct answer: <strong>{exercise.answer}</strong>
        </div>
      )}

      {!submitted ? (
        <button onClick={handleCheck} disabled={chosen.length === 0} style={{
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          background: chosen.length === 0 ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)',
          color: '#fff', fontSize: '1rem', fontWeight: 700,
          cursor: chosen.length === 0 ? 'not-allowed' : 'pointer',
          opacity: chosen.length === 0 ? 0.5 : 1,
        }}>
          Check ✓
        </button>
      ) : wrong ? (
        <NextButton onNext={onNext} />
      ) : null}
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
  const [exercises] = useState<BookExercise[]>(() =>
    weightedSample(BOOK_EXERCISES, EXERCISE_COUNT, wordStats)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);

  const current = exercises[currentIdx];

  const handleAnswer = useCallback((correct: boolean) => {
    setAnsweredCorrect(correct);
    if (correct) setScore((s) => s + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (answeredCorrect === null) return;
    const newResults = [...results, { id: current.id, correct: answeredCorrect }];
    setResults(newResults);

    if (currentIdx + 1 >= exercises.length) {
      const finalScore = score; // already updated by handleAnswer
      if (currentProfile) {
        const log = newResults.map((r) => ({
          questionText: r.id,
          firstTryCorrect: r.correct,
        }));
        updateProfileStats(currentProfile.id, 0, log);
      }
      onResults(finalScore, exercises.length);
    } else {
      setAnsweredCorrect(null);
      setCurrentIdx((i) => i + 1);
    }
  }, [answeredCorrect, currentIdx, exercises, score, results, current, currentProfile, updateProfileStats, onResults]);

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

      {/* Instruction */}
      <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginBottom: '10px' }}>
        {current.instruction}
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

      {/* Question */}
      {current.question && (
        <div style={{
          fontSize: '1.05rem', fontWeight: 600, marginBottom: '18px', lineHeight: 1.5,
        }}>
          {current.type === 'odd-one-out'
            ? `Which word does NOT belong in the group: "${current.question}"?`
            : current.question}
        </div>
      )}

      {/* Exercise */}
      <div style={{ flex: 1 }}>
        {current.type === 'multiple-choice' && (
          <MultipleChoiceExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
        {current.type === 'true-false' && (
          <TrueFalseExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
        {current.type === 'fill-blank' && (
          <FillBlankExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
        {current.type === 'odd-one-out' && (
          <OddOneOutExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
        {current.type === 'a-an' && (
          <AAnExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
        {current.type === 'word-order' && (
          <WordOrderExercise key={current.id} exercise={current} onAnswer={handleAnswer} onNext={handleNext} />
        )}
      </div>
    </div>
  );
}
