import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import questionsData from '../data/questions.json';
import intensiveQuestionsData from '../data/intensive_questions.json';

// 과목별 보기 풀 구성
const subjectOptionsPool = {};
questionsData.forEach(q => {
  if (q.subject && Array.isArray(q.options)) {
    if (!subjectOptionsPool[q.subject]) {
      subjectOptionsPool[q.subject] = new Set();
    }
    q.options.forEach(opt => {
      if (opt && opt.trim() !== '') {
        subjectOptionsPool[q.subject].add(opt.trim());
      }
    });
  }
});
Object.keys(subjectOptionsPool).forEach(sub => {
  subjectOptionsPool[sub] = Array.from(subjectOptionsPool[sub]);
});

// 랜덤 보기 믹싱 함수
function getRandomFakeOptions(subject, count, excludeList) {
  const pool = subjectOptionsPool[subject] || [];
  const result = [];
  const maxAttempts = 500;
  let attempts = 0;
  while (result.length < count && attempts < maxAttempts) {
    attempts++;
    const randOpt = pool[Math.floor(Math.random() * pool.length)];
    if (!randOpt) continue;
    const isExcluded = excludeList.some(ex => 
      ex.toLowerCase() === randOpt.toLowerCase() || 
      randOpt.includes(ex) || 
      ex.includes(randOpt)
    );
    const isAlreadySelected = result.includes(randOpt);
    if (!isExcluded && !isAlreadySelected) {
      result.push(randOpt);
    }
  }
  while (result.length < count) {
    result.push(`기타 보기 항목 대안 ${result.length + 1}`);
  }
  return result;
}

// 런타임 집중 암기 데이터를 동적으로 믹싱하는 함수
function getRuntimeIntensiveQuestions() {
  return intensiveQuestionsData.map(q => {
    const isTransformed = q.id.endsWith('-A') || q.id.endsWith('-B') || q.id.endsWith('-C');
    if (isTransformed) {
      const trueOptionText = q.options[q.answer - 1];
      const correctSlot = Math.floor(Math.random() * 4);
      const fakeOptions = getRandomFakeOptions(q.subject, 3, q.options);
      
      const newOptions = new Array(4);
      newOptions[correctSlot] = trueOptionText;
      let fakeIdx = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== correctSlot) {
          newOptions[i] = fakeOptions[fakeIdx++];
        }
      }
      return {
        ...q,
        options: newOptions,
        answer: correctSlot + 1
      };
    }
    return q;
  });
}

export const useQuizStore = create(
  persist(
    (set, get) => ({
      questions: [],
      isIntensiveMode: false,
      bookmarks: [], // Array of question IDs
      wrongAnswers: [], // Array of question IDs
      solvedHistory: {}, // { [questionId]: { isCorrect: boolean, selectedAnswer: number, solvedAt: string } }
      theme: 'light',
      optionNotes: {}, // { [questionId]: { [optionNumber]: "사용자 오답 메모" } }
      comparisonTables: [], // [ { id, title, columns: ["항목1", "항목2"], rows: [ { attr, val1, val2 } ] } ]
      mindmapNotes: {}, // { [nodeId]: "사용자 백지 복습 메모" }

      // DB에서 문제 데이터를 비동기로 가져오는 액션
      fetchQuestions: async () => {
        const { isIntensiveMode } = get();
        set({ questions: isIntensiveMode ? getRuntimeIntensiveQuestions() : questionsData });
      },

      toggleIntensiveMode: () => {
        set((state) => {
          const nextMode = !state.isIntensiveMode;
          return {
            isIntensiveMode: nextMode,
            questions: nextMode ? getRuntimeIntensiveQuestions() : questionsData
          };
        });
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

      clearHistory: () => set({
        solvedHistory: {},
        wrongAnswers: [],
        bookmarks: [],
        optionNotes: {},
        comparisonTables: [],
        mindmapNotes: {}
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
        isIntensiveMode: state.isIntensiveMode
      })
    }
  )
);
