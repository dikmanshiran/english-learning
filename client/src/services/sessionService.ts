import api from './api';
import { QuestionLogEntry, WrongAnswer } from '../types/game';

export interface SessionPayload {
  profileId: string;
  units: number[];
  questionCount: number;
  score: number;
  stars: number;
  livesLeft: number;
  questions: Array<{
    kind: 'E2H' | 'H2E' | 'SENTENCE' | 'LISTEN' | 'LETTER_CHOICE' | 'LETTER_TYPE';
    questionText: string;
    answer: string;
    chosen: string;
    correct: boolean;
    firstTry: boolean;
  }>;
}

function kindMap(k: string): 'E2H' | 'H2E' | 'SENTENCE' | 'LISTEN' | 'LETTER_CHOICE' | 'LETTER_TYPE' {
  switch (k) {
    case 'e2h': return 'E2H';
    case 'h2e': return 'H2E';
    case 'sentence': return 'SENTENCE';
    case 'listen': return 'LISTEN';
    case 'letter-choice': return 'LETTER_CHOICE';
    case 'letter-type': return 'LETTER_TYPE';
    default: return 'E2H';
  }
}

export async function saveSession(
  profileId: string,
  units: number[],
  questionCount: number,
  score: number,
  stars: number,
  livesLeft: number,
  questionLog: QuestionLogEntry[],
  wrongAnswers: WrongAnswer[]
) {
  const wrongMap = new Map(wrongAnswers.map((w) => [w.q.question, w]));
  const questions = questionLog.map(({ q, firstTryCorrect }) => {
    const wa = wrongMap.get(q.question);
    return {
      kind: kindMap(q.kind),
      questionText: q.question,
      answer: q.answer,
      chosen: firstTryCorrect ? q.answer : (wa?.chosen || ''),
      correct: firstTryCorrect,
      firstTry: firstTryCorrect,
    };
  });
  const { data } = await api.post('/sessions', {
    profileId,
    units,
    questionCount,
    score,
    stars,
    livesLeft,
    questions,
  });
  return data;
}
