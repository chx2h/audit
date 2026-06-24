import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { BookOpen, Calendar, Award, BookMarked, RefreshCw, Moon, Sun, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home({ onStartQuiz }) {
  const {
    questions,
    bookmarks,
    wrongAnswers,
    solvedHistory,
    theme,
    toggleTheme,
    clearHistory,
  } = useQuizStore();

  // Statistics calculation
  const totalQuestions = questions.length;
  const solvedCount = Object.keys(solvedHistory).length;
  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  const correctCount = Object.values(solvedHistory).filter(h => h.isCorrect).length;
  const accuracyPercent = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;

  // Extract unique subjects and years
  const subjects = [...new Set(questions.map(q => q.subject))].filter(Boolean);
  const years = [...new Set(questions.map(q => q.year))].filter(Boolean).sort((a, b) => b - a);

  // Group questions by subject to count
  const getSubjectCount = (sub) => questions.filter(q => q.subject === sub).length;
  const getSubjectSolvedCount = (sub) => {
    const subQIds = questions.filter(q => q.subject === sub).map(q => q.id);
    return Object.keys(solvedHistory).filter(id => subQIds.includes(id)).length;
  };

  const handleReset = () => {
    if (window.confirm('모든 학습 기록(풀이 역사, 오답 노트, 북마크)을 초기화하시겠습니까?')) {
      clearHistory();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="text-primary-600 dark:text-primary-400">패스</span> 문제은행
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">모바일 특화 오답 암기 시스템</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 tap-highlight"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Stats Card Dashboard */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">내 학습 진척도</h2>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">진도율</span>
              <span className="text-2xl font-bold text-slate-950 dark:text-white">{progressPercent}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">({solvedCount} / {totalQuestions} 문제)</span>
            </div>
            <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">평균 정답률</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracyPercent}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">({correctCount}개 맞춤)</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-primary-600 dark:bg-primary-500 h-full rounded-full"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
            <span>북마크 {bookmarks.length}개</span>
            <span>오답노트 {wrongAnswers.length}개</span>
          </div>
        </div>
      </section>

      {/* Quick Play Menu */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">스피드 트레이닝</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartQuiz({ type: 'random', count: 10 })}
            className="flex flex-col items-start text-left p-5 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-md shadow-primary-500/10"
          >
            <div className="p-2 rounded-xl bg-white/10 mb-4 text-white">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="font-semibold text-base mb-1">랜덤 모의고사</span>
            <span className="text-xs text-white/70">무작위 10문항 풀기</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => wrongAnswers.length > 0 && onStartQuiz({ type: 'wrong' })}
            disabled={wrongAnswers.length === 0}
            className={`flex flex-col items-start text-left p-5 rounded-2xl text-white shadow-md transition-all ${wrongAnswers.length > 0
                ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/10'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
          >
            <div className={`p-2 rounded-xl mb-4 ${wrongAnswers.length > 0 ? 'bg-white/10 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-400'}`}>
              <Award size={20} />
            </div>
            <span className="font-semibold text-base mb-1">자동 오답 노트</span>
            <span className="text-xs opacity-80">{wrongAnswers.length}개 대기 중</span>
          </motion.button>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">단원별 집중 학습</h2>
        <div className="space-y-3">
          {subjects.map((sub, idx) => {
            const subCount = getSubjectCount(sub);
            const subSolved = getSubjectSolvedCount(sub);
            const pct = subCount > 0 ? Math.round((subSolved / subCount) * 100) : 0;
            return (
              <motion.button
                key={`subject-${sub}-${idx}`}
                whileTap={{ scale: 0.99 }}
                onClick={() => onStartQuiz({ type: 'subject', value: sub })}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-left tap-highlight"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">{sub}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      진행률 {pct}% ({subSolved}/{subCount} 문제)
                    </p>
                  </div>
                </div>
                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-primary-600 h-full" style={{ width: `${pct}%` }} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Years Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">기출 연도별 풀기</h2>
        <div className="grid grid-cols-2 gap-3">
          {years.map((year, idx) => (
            <motion.button
              key={`year-${year}-${idx}`}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartQuiz({ type: 'year', value: year })}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Calendar size={18} />
                </div>
                <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{year}년 기출</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bookmarks Section */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">보관함</h2>
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => bookmarks.length > 0 && onStartQuiz({ type: 'bookmark' })}
          disabled={bookmarks.length === 0}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${bookmarks.length > 0
              ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 tap-highlight'
              : 'bg-slate-50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-900 opacity-60 cursor-not-allowed'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bookmarks.length > 0 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <BookMarked size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">북마크 문제만 풀기</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">총 {bookmarks.length}개 보관됨</p>
            </div>
          </div>
        </motion.button>
      </section>

      {/* Reset Area */}
      <div className="text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 text-xs text-red-500 dark:text-red-400 hover:underline opacity-80"
        >
          <RefreshCw size={12} />
          학습 기록 초기화
        </button>
      </div>
    </div>
  );
}
