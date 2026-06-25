import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import questionsData from '../data/questions.json';

export const useQuizStore = create(
  persist(
    (set, get) => ({
      questions: [],
      bookmarks: [], // Array of question IDs
      wrongAnswers: [], // Array of question IDs
      solvedHistory: {}, // { [questionId]: { isCorrect: boolean, selectedAnswer: number, solvedAt: string } }
      theme: 'light',
      optionNotes: {}, // { [questionId]: { [optionNumber]: "사용자 오답 메모" } }
      comparisonTables: [], // [ { id, title, columns: ["항목1", "항목2"], rows: [ { attr, val1, val2 } ] } ]
      mindmapNotes: {}, // { [nodeId]: "사용자 백지 복습 메모" }
      wordCorrections: {}, // { [questionId]: { wrongWord: "틀린 단어", correctWord: "바른 단어" } }

      // DB에서 문제 데이터를 비동기로 가져오는 액션
      fetchQuestions: async () => {
        try {
          // 로컬 개발/Vercel 실배포에 모두 호환되는 상대 경로로 호출합니다.
          const response = await fetch('/api/questions');
          if (!response.ok) throw new Error('API 응답에 오류가 발생했습니다.');
          const data = await response.json();
          set({ questions: data });
        } catch (error) {
          console.error("문제 로드 실패: 로컬 백업 데이터를 사용합니다.", error);
          // 실제 API 연결 실패 시 앱 작동을 위해 로컬 파일 데이터로 폴백
          set({ questions: questionsData });
        }
      },

      // Bookmarks Actions
      toggleBookmark: (id) => set((state) => {
        const isBookmarked = state.bookmarks.includes(id);
        const newBookmarks = isBookmarked
          ? state.bookmarks.filter(bId => bId !== id)
          : [...state.bookmarks, id];
        return { bookmarks: newBookmarks };
      }),

      // Wrong Answers Actions
      addWrongAnswer: (id) => set((state) => {
        if (state.wrongAnswers.includes(id)) return {};
        return { wrongAnswers: [...state.wrongAnswers, id] };
      }),

      removeWrongAnswer: (id) => set((state) => ({
        wrongAnswers: state.wrongAnswers.filter(wId => wId !== id)
      })),

      // Solved History Actions
      saveSolveRecord: (id, selectedAnswer, isCorrect) => set((state) => {
        const newHistory = {
          ...state.solvedHistory,
          [id]: {
            selectedAnswer,
            isCorrect,
            solvedAt: new Date().toISOString()
          }
        };

        let newWrongAnswers = [...state.wrongAnswers];
        if (!isCorrect) {
          if (!newWrongAnswers.includes(id)) {
            newWrongAnswers.push(id);
          }
        } else {
          newWrongAnswers = newWrongAnswers.filter(wId => wId !== id);
        }

        return {
          solvedHistory: newHistory,
          wrongAnswers: newWrongAnswers
        };
      }),

      // Option Notes Actions (O/X 쪼개기용)
      saveOptionNote: (qId, optionNum, noteText) => set((state) => {
        const currentNotes = state.optionNotes[qId] || {};
        return {
          optionNotes: {
            ...state.optionNotes,
            [qId]: {
              ...currentNotes,
              [optionNum]: noteText
            }
          }
        };
      }),

      // Comparison Table Actions (비교 분석용)
      addComparisonTable: (table) => set((state) => ({
        comparisonTables: [...state.comparisonTables, table]
      })),

      deleteComparisonTable: (tableId) => set((state) => ({
        comparisonTables: state.comparisonTables.filter(t => t.id !== tableId)
      })),

      // Mindmap Notes Actions (키워드 꼬리물기용)
      saveMindmapNote: (nodeId, noteText) => set((state) => ({
        mindmapNotes: {
          ...state.mindmapNotes,
          [nodeId]: noteText
        }
      })),

      // Word Correction Actions (오답 단어 치환용)
      saveWordCorrection: (qId, wrongWord, correctWord) => set((state) => ({
        wordCorrections: {
          ...state.wordCorrections,
          [qId]: { wrongWord, correctWord }
        }
      })),

      clearHistory: () => set({
        solvedHistory: {},
        wrongAnswers: [],
        bookmarks: [],
        optionNotes: {},
        comparisonTables: [],
        mindmapNotes: {},
        wordCorrections: {}
      }),

      // Theme Actions
      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: nextTheme };
      }),

      initTheme: () => {
        const currentTheme = get().theme;
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'audit-quiz-storage', // key in LocalStorage
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        wrongAnswers: state.wrongAnswers,
        solvedHistory: state.solvedHistory,
        theme: state.theme,
        optionNotes: state.optionNotes,
        comparisonTables: state.comparisonTables,
        mindmapNotes: state.mindmapNotes,
        wordCorrections: state.wordCorrections
      })
    }
  )
);
