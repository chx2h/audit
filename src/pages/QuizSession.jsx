import React, { useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ArrowLeft, Bookmark, CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizSession({ sessionType, sessionValue, count, onBackToHome, onFinish }) {
  const {
    questions,
    bookmarks,
    toggleBookmark,
    saveSolveRecord,
  } = useQuizStore();

  // 1. Prepare quiz questions based on session type
  const [quizSet] = useState(() => {
    let list = [];
    if (sessionType === 'random') {
      // Shuffle all and take 'count'
      list = [...questions].sort(() => 0.5 - Math.random()).slice(0, count || 10);
    } else if (sessionType === 'subject') {
      list = questions.filter(q => q.subject === sessionValue);
    } else if (sessionType === 'year') {
      list = questions.filter(q => q.year === Number(sessionValue));
    } else if (sessionType === 'wrong') {
      const { wrongAnswers } = useQuizStore.getState();
      list = questions.filter(q => wrongAnswers.includes(q.id));
    } else if (sessionType === 'bookmark') {
      const { bookmarks } = useQuizStore.getState();
      list = questions.filter(q => bookmarks.includes(q.id));
    }

    // Default fallback
    if (list.length === 0) list = [questions[0]];
    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  // Track selected answer for each question: { [questionId]: answerIndex (1-4) }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [direction, setDirection] = useState(0); // For slide animation direction: -1 (left), 1 (right)

  const currentQuestion = quizSet[currentIndex];
  const totalQuestions = quizSet.length;
  
  const isBookmarked = bookmarks.includes(currentQuestion?.id);
  const selectedAnswer = selectedAnswers[currentQuestion?.id];
  const isAnswered = selectedAnswer !== undefined;

  const handleSelectOption = (optionIndex) => {
    if (isAnswered) return; // Lock after answering

    const questionId = currentQuestion.id;
    const isCorrect = optionIndex === currentQuestion.answer;

    // Save in local state
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    // Record in global Zustand store (syncs with localStorage & wrongAnswers list)
    saveSolveRecord(questionId, optionIndex, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate final results
      const results = quizSet.map(q => {
        const sel = selectedAnswers[q.id];
        return {
          ...q,
          selectedAnswer: sel,
          isCorrect: sel === q.answer
        };
      });
      onFinish(results);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Swipe logic
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      // Swiped left -> Go to Next
      if (isAnswered) {
        handleNext();
      }
    } else if (info.offset.x > swipeThreshold) {
      // Swiped right -> Go to Prev
      handlePrev();
    }
  };

  // Page slide variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 relative min-h-screen flex flex-col">
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToHome}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 tap-highlight bg-slate-100 dark:bg-slate-900"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {sessionType === 'random' && '랜덤 모의고사'}
          {sessionType === 'subject' && sessionValue}
          {sessionType === 'year' && `${sessionValue}년 기출`}
          {sessionType === 'wrong' && '오답 노트 풀기'}
          {sessionType === 'bookmark' && '북마크 학습'}
        </span>
        <button
          onClick={() => toggleBookmark(currentQuestion.id)}
          className={`p-2 rounded-xl tap-highlight border transition-colors ${
            isBookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20 dark:border-amber-800'
              : 'bg-slate-100 border-transparent text-slate-400 dark:bg-slate-900 dark:text-slate-500'
          }`}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </header>

      {/* Progress Bar & Indicators */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
          <span>진행도 {currentIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="flex-1 flex flex-col cursor-grab active:cursor-grabbing select-none"
          >
            {/* Subject badge and info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                {currentQuestion.subject}
              </span>
              {currentQuestion.year && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  {currentQuestion.year}년
                </span>
              )}
            </div>

            {/* Question description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                <span className="text-primary-600 dark:text-primary-400 mr-1.5">Q{currentQuestion.no}.</span>
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options (min height 48px, optimized for one-hand touch) */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const optionNum = idx + 1;
                const isSelected = selectedAnswer === optionNum;
                const isCorrectOption = optionNum === currentQuestion.answer;
                
                let optionStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    // Always highlight correct answer
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300';
                  } else if (isSelected && !isCorrectOption) {
                    // Highlight wrong selection
                    optionStyle = 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300';
                  } else {
                    optionStyle = 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 opacity-60';
                  }
                } else {
                  // Normal hover/active states
                  optionStyle += ' active:border-primary-400 dark:active:border-primary-500 active:bg-slate-50 dark:active:bg-slate-800/50';
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelectOption(optionNum)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 min-h-[56px] flex items-center justify-between border-2 rounded-2xl transition-all shadow-sm ${optionStyle} tap-highlight`}
                  >
                    <span className="text-sm font-medium flex-1 pr-3 leading-relaxed">
                      <span className="font-bold mr-2 text-slate-400 dark:text-slate-500">{optionNum}.</span>
                      {option}
                    </span>
                    {isAnswered && (
                      <span className="flex-shrink-0">
                        {isCorrectOption && <CheckCircle2 size={20} className="text-emerald-500" />}
                        {isSelected && !isCorrectOption && <XCircle size={20} className="text-rose-500" />}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation section (revealed smoothly after choice) */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 dark:bg-slate-900 dark:border-slate-800 shadow-inner mb-6"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold mb-2 text-sm">
                    <HelpCircle size={16} />
                    <span>해설 및 오답 분석</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-slate-50/0 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950/0 p-4 border-t border-slate-200/20 max-w-md mx-auto flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed tap-highlight"
        >
          이전 문제
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-md tap-highlight transition-all ${
            isAnswered
              ? 'bg-primary-600 dark:bg-primary-500 shadow-primary-500/10'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
          }`}
        >
          {currentIndex === totalQuestions - 1 ? '결과 보기' : '다음 문제'}
          <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}
