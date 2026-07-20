import { useRef, useState } from 'react';
import { playTone } from './useGame';

interface UseAnswerFeedbackOptions {
  onFirstWrong: () => void;
  onCorrect: () => void;
  onConfetti: () => void;
  onFlash?: (type: 'correct' | 'wrong') => void;
}

// Shared correct/wrong state machine for exercise-style questions: flashes the
// chosen option, plays a tone, fires confetti + a screen flash on correct, and
// resets wrong choices after 800ms (matching GameScreen's vocabulary flow) so
// every question type in the app behaves identically on answer.
export function useAnswerFeedback({ onFirstWrong, onCorrect, onConfetti, onFlash }: UseAnswerFeedbackOptions) {
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const firstTry = useRef(true);

  function submit(choice: string, isCorrect: boolean, onWrongReset?: () => void) {
    if (resetting || correctChoice) return;

    if (isCorrect) {
      playTone(true);
      onConfetti();
      onFlash?.('correct');
      setCorrectChoice(choice);
      setTimeout(onCorrect, 700);
    } else {
      if (firstTry.current) {
        onFirstWrong();
        firstTry.current = false;
      }
      playTone(false);
      onFlash?.('wrong');
      setWrongChoice(choice);
      setResetting(true);
      setTimeout(() => {
        setWrongChoice(null);
        setResetting(false);
        onWrongReset?.();
      }, 800);
    }
  }

  return { wrongChoice, correctChoice, resetting, submit };
}
