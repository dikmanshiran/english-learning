import { create } from 'zustand';
import { Question, VocabItem, WrongAnswer, QuestionLogEntry } from '../types/game';

interface GameState {
  questions: Question[];
  currentQ: number;
  score: number;
  lives: number;
  streak: number;
  answered: boolean;
  resetting: boolean;
  wrongAnswers: WrongAnswer[];
  questionLog: QuestionLogEntry[];
  selectedUnits: Array<number | 'all'>;
  questionCount: number;
  beginnerWords: VocabItem[];

  setQuestions: (questions: Question[]) => void;
  setSelectedUnits: (units: Array<number | 'all'>) => void;
  setQuestionCount: (n: number) => void;
  setBeginnerWords: (words: VocabItem[]) => void;
  resetGame: () => void;
  markAnswered: () => void;
  markResetting: (v: boolean) => void;
  incrementScore: (bonus: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  loseLife: () => void;
  nextQuestion: () => void;
  addWrongAnswer: (wa: WrongAnswer) => void;
  addQuestionLog: (entry: QuestionLogEntry) => void;
  markCurrentWrongLogged: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  questions: [],
  currentQ: 0,
  score: 0,
  lives: 3,
  streak: 0,
  answered: false,
  resetting: false,
  wrongAnswers: [],
  questionLog: [],
  selectedUnits: ['all'],
  questionCount: 10,
  beginnerWords: [],

  setQuestions: (questions) => set({ questions }),
  setSelectedUnits: (selectedUnits) => set({ selectedUnits }),
  setQuestionCount: (questionCount) => set({ questionCount }),
  setBeginnerWords: (beginnerWords) => set({ beginnerWords }),

  resetGame: () =>
    set({ currentQ: 0, score: 0, lives: 3, streak: 0, answered: false, resetting: false, wrongAnswers: [], questionLog: [] }),

  markAnswered: () => set({ answered: true }),
  markResetting: (v) => set({ resetting: v }),
  incrementScore: (bonus) => set((s) => ({ score: s.score + bonus })),
  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
  loseLife: () => set((s) => ({ lives: Math.max(0, s.lives - 1) })),
  nextQuestion: () => set((s) => ({ currentQ: s.currentQ + 1, answered: false, resetting: false })),
  addWrongAnswer: (wa) => set((s) => ({ wrongAnswers: [...s.wrongAnswers, wa] })),
  addQuestionLog: (entry) => set((s) => ({ questionLog: [...s.questionLog, entry] })),
  markCurrentWrongLogged: () =>
    set((s) => {
      const questions = [...s.questions];
      if (questions[s.currentQ]) {
        questions[s.currentQ] = { ...questions[s.currentQ], _wrongLogged: true };
      }
      return { questions };
    }),
}));
