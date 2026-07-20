import { useState, useCallback } from 'react';
import { BOOK_EXERCISES, BookExercise } from '../data/bookExercises';
import { useProfileStore } from '../store/profileStore';
import { useGameStore } from '../store/gameStore';
import { useAnswerFeedback } from '../hooks/useAnswerFeedback';
import { OptionButton } from '../components/OptionButton';
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
// onFlash:      triggers the shared full-screen correct/wrong flash (see ExercisesScreen)

interface ExerciseProps {
  exercise: BookExercise;
  onFirstWrong: () => void;
  onCorrect: () => void;
  onConfetti: () => void;
  onFlash: (type: 'correct' | 'wrong') => void;
}

function optionState(opt: string, wrongChoice: string | null, correctChoice: string | null) {
  if (opt === correctChoice) return 'correct';
  if (opt === wrongChoice) return 'wrong';
  if (correctChoice) return 'disabled';
  return 'default';
}

// ── Multiple choice ────────────────────────────────────────────────────────

function MultipleChoiceExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const [shuffledOptions] = useState(() => shuffle(exercise.options));
  const { wrongChoice, correctChoice, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {shuffledOptions.map((opt) => (
        <OptionButton
          key={opt}
          text={opt}
          isHebrew={false}
          state={optionState(opt, wrongChoice, correctChoice)}
          onClick={() => submit(opt, opt === exercise.answer)}
        />
      ))}
    </div>
  );
}

// ── True / False ───────────────────────────────────────────────────────────

function TrueFalseExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const { wrongChoice, correctChoice, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });

  return (
    <div className="options-grid">
      {['True', 'False'].map((opt) => (
        <OptionButton
          key={opt}
          text={opt === 'True' ? '✅ True' : '❌ False'}
          isHebrew={false}
          state={optionState(opt, wrongChoice, correctChoice)}
          onClick={() => submit(opt, opt === exercise.answer)}
        />
      ))}
    </div>
  );
}

// ── Fill blank ─────────────────────────────────────────────────────────────

function FillBlankExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const [shuffledOptions] = useState(() => shuffle(exercise.options));
  const { wrongChoice, correctChoice, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });
  const parts = exercise.question.split('___');

  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
        padding: '16px', marginBottom: '16px', fontSize: '1.05rem', lineHeight: 1.7,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block', minWidth: '80px', borderBottom: `2px solid ${correctChoice ? 'var(--success)' : 'var(--secondary)'}`,
          textAlign: 'center', color: correctChoice ? 'var(--success)' : 'var(--text-dim)', margin: '0 4px',
          transition: 'all 0.2s',
        }}>
          {correctChoice || '___'}
        </span>
        {parts[1]}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shuffledOptions.map((opt) => (
          <OptionButton
            key={opt}
            text={opt}
            isHebrew={false}
            state={optionState(opt, wrongChoice, correctChoice)}
            onClick={() => submit(opt, opt === exercise.answer)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Odd one out ────────────────────────────────────────────────────────────

function OddOneOutExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const { wrongChoice, correctChoice, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });

  return (
    <div className="options-grid">
      {exercise.options.map((opt) => (
        <OptionButton
          key={opt}
          text={opt}
          isHebrew={false}
          state={optionState(opt, wrongChoice, correctChoice)}
          onClick={() => submit(opt, opt === exercise.answer)}
        />
      ))}
    </div>
  );
}

// ── A / An ─────────────────────────────────────────────────────────────────

function AAnExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const { wrongChoice, correctChoice, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });
  const word = exercise.question.replace('___ ', '');

  return (
    <div>
      <div style={{
        textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
        marginBottom: '24px', color: correctChoice ? 'var(--success)' : 'var(--secondary)',
        transition: 'color 0.2s',
      }}>
        {correctChoice ? `${correctChoice} ${word}` : `___ ${word}`}
      </div>
      <div className="options-grid">
        {['a', 'an'].map((opt) => (
          <OptionButton
            key={opt}
            text={opt}
            isHebrew={false}
            state={optionState(opt, wrongChoice, correctChoice)}
            onClick={() => submit(opt, opt === exercise.answer)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Word order ─────────────────────────────────────────────────────────────

function WordOrderExercise({ exercise, onFirstWrong, onCorrect, onConfetti, onFlash }: ExerciseProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(() => shuffle(exercise.options));
  const { wrongChoice, correctChoice, resetting, submit } = useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash });
  const isWrong = !!wrongChoice;

  function addWord(word: string, idx: number) {
    if (resetting || correctChoice) return;
    setChosen((prev) => [...prev, word]);
    setRemaining((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function removeWord(word: string, idx: number) {
    if (resetting || correctChoice) return;
    setRemaining((prev) => [...prev, word]);
    setChosen((prev) => { const next = [...prev]; next.splice(idx, 1); return next; });
  }

  function handleCheck() {
    if (resetting || correctChoice || chosen.length === 0) return;
    const attempt = chosen.join(' ');
    submit(attempt, attempt === exercise.answer, () => {
      setChosen([]);
      setRemaining(shuffle(exercise.options));
    });
  }

  return (
    <div>
      {/* Answer area */}
      <div className={isWrong ? 'shake' : ''} style={{
        minHeight: '56px', borderRadius: '14px', padding: '12px 14px',
        border: `2px solid ${isWrong ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}`,
        background: isWrong ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
        display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px',
        transition: 'border 0.2s, background 0.2s',
      }}>
        {chosen.length === 0 && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Tap words below to build the sentence</span>
        )}
        {chosen.map((w, i) => (
          <span key={i} onClick={() => removeWord(w, i)} style={{
            background: 'var(--primary)', borderRadius: '8px', padding: '4px 10px',
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
            background: 'var(--card)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '0.95rem',
            cursor: resetting ? 'default' : 'pointer', opacity: resetting ? 0.5 : 1,
          }}>
            {w}
          </button>
        ))}
      </div>

      <button onClick={handleCheck} disabled={chosen.length === 0 || resetting} style={{
        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
        background: chosen.length === 0 ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
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
  onConfetti: () => void;
}

export function ExercisesScreen({ onHome, onResults, onConfetti }: ExercisesScreenProps) {
  const { wordStats, currentProfile, updateProfileStats } = useProfileStore();
  const { questionCount } = useGameStore();
  const [exercises] = useState<BookExercise[]>(() =>
    weightedSample(filterByLevel(BOOK_EXERCISES, currentProfile?.level ?? 'INTERMEDIATE'), questionCount, (e) => e.id, wordStats)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ id: string; firstTryCorrect: boolean }[]>([]);
  const [screenFlash, setScreenFlash] = useState<'correct' | 'wrong' | null>(null);

  const current = exercises[currentIdx];

  const handleFlash = useCallback((type: 'correct' | 'wrong') => {
    setScreenFlash(type);
    setTimeout(() => setScreenFlash(null), type === 'correct' ? 650 : 500);
  }, []);

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
      {screenFlash && <div className={`screen-flash ${screenFlash}`} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button className="back-btn" onClick={onHome}>← Home</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              {currentIdx + 1} / {exercises.length}
            </span>
            <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
              ⭐ {score}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <div style={{
              height: '100%', background: 'var(--primary)',
              borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Topic chip */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          background: 'rgba(108,63,197,0.3)', borderRadius: '20px',
          padding: '4px 12px', fontSize: '0.78rem', color: 'var(--primary)',
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
          borderLeft: '3px solid var(--primary)',
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
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
        {current.type === 'true-false' && (
          <TrueFalseExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
        {current.type === 'fill-blank' && (
          <FillBlankExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
        {current.type === 'odd-one-out' && (
          <OddOneOutExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
        {current.type === 'a-an' && (
          <AAnExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
        {current.type === 'word-order' && (
          <WordOrderExercise key={current.id} exercise={current}
            onFirstWrong={handleFirstWrongCurrent} onCorrect={handleCorrectCurrent} onConfetti={onConfetti} onFlash={handleFlash} />
        )}
      </div>
    </div>
  );
}
