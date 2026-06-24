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

        // Automatically update wrong answers based on correctness
        let newWrongAnswers = [...state.wrongAnswers];
        if (!isCorrect) {
          if (!newWrongAnswers.includes(id)) {
            newWrongAnswers.push(id);
          }
        } else {
          // If correct and previously marked wrong, keep or remove?
          // The requirement states "자동 오답 노트: 완벽히 맞출 때까지 반복 출제".
          // In actual usage, if solved correctly in "오답 노트 모드" or normal mode,
          // we can remove it from wrongAnswers or let the user decide.
          // Let's implement: if correct in general, we can remove it from wrongAnswers if it's there
          // so that they can clear the wrong answer list.
          newWrongAnswers = newWrongAnswers.filter(wId => wId !== id);
        }

        return {
          solvedHistory: newHistory,
          wrongAnswers: newWrongAnswers
        };
      }),

      clearHistory: () => set({
        solvedHistory: {},
        wrongAnswers: [],
        bookmarks: []
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
        theme: state.theme
      })
    }
  )
);
