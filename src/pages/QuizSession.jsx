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
    optionNotes,
    saveOptionNote,
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
      setCurrentIndex(prev => prev + 1); // 주의: 이전 문제는 -1 이어야 함. 기존 코드 복사: setCurrentIndex(prev => prev - 1)
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
    <div className="max-w-md mx-auto px-4 py-8 pb-28 relative min-h-screen flex flex-col font-sans text-[17px] tracking-tight">
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToHome}
          className="p-2 rounded-full border border-apple-border dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 tap-highlight bg-white dark:bg-neutral-900 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-350 font-mono uppercase tracking-wider">
          {sessionType === 'random' && 'Random Exam'}
          {sessionType === 'subject' && sessionValue}
          {sessionType === 'year' && `${sessionValue} Year`}
          {sessionType === 'wrong' && 'Incorrect Qs'}
          {sessionType === 'bookmark' && 'Bookmarks'}
        </span>
        <button
          onClick={() => toggleBookmark(currentQuestion.id)}
          className={`p-2 rounded-full tap-highlight border transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900'
              : 'bg-white border-apple-border text-neutral-400 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-500'
          }`}
        >
          <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </header>

      {/* Progress Bar & Indicators */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-[10px] font-mono text-apple-gray dark:text-neutral-500 mb-1.5 font-medium">
          <span>PROGRESS {currentIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-200/10">
          <div
            className="bg-apple-blue h-full transition-all duration-300"
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
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-apple-pearl text-neutral-850 dark:bg-neutral-800 dark:text-neutral-300 border border-apple-border dark:border-neutral-700/50">
                {currentQuestion.subject}
              </span>
              {currentQuestion.year && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-apple-pearl text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-apple-border dark:border-neutral-800/80">
                  {currentQuestion.year}년
                </span>
              )}
            </div>

            {/* Question description */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-neutral-950 dark:text-white leading-relaxed">
                <span className="text-neutral-400 dark:text-neutral-500 mr-2 font-mono">Q{currentQuestion.no}.</span>
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const optionNum = idx + 1;
                const isSelected = selectedAnswer === optionNum;
                const isCorrectOption = optionNum === currentQuestion.answer;
                const noteVal = (optionNotes[currentQuestion.id] && optionNotes[currentQuestion.id][optionNum]) || '';
                
                let optionStyle = 'border-apple-border dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionStyle = 'border-emerald-500 dark:border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-red-500 dark:border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
                  } else {
                    optionStyle = 'border-apple-border dark:border-neutral-950 bg-apple-pearl/30 dark:bg-neutral-950/20 text-neutral-400 dark:text-neutral-600 opacity-60';
                  }
                } else {
                  optionStyle += ' hover:border-apple-gray dark:hover:border-neutral-750 active:bg-neutral-50 dark:active:bg-neutral-800/30';
                }

                return (
                  <div key={idx} className="space-y-1.5">
                    <motion.button
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelectOption(optionNum)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 min-h-[56px] flex items-center justify-between border rounded-apple-md transition-all ${optionStyle} tap-highlight cursor-pointer`}
                    >
                      <span className="text-xs font-medium flex-1 pr-3 leading-relaxed">
                        <span className="font-mono font-bold mr-2 text-neutral-400 dark:text-neutral-500">{optionNum}.</span>
                        {option}
                      </span>
                      {isAnswered && (
                        <span className="flex-shrink-0">
                          {isCorrectOption && <CheckCircle2 size={16} className="text-emerald-500" />}
                          {isSelected && !isCorrectOption && <XCircle size={16} className="text-red-500" />}
                        </span>
                      )}
                    </motion.button>
                    
                    {/* O/X 역추적 학습용 메모란 */}
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden px-1"
                        >
                          <input
                            type="text"
                            placeholder={`보기 ${optionNum}번 분석 (틀렸거나 맞은 이유)`}
                            value={noteVal}
                            onChange={(e) => saveOptionNote(currentQuestion.id, optionNum, e.target.value)}
                            className="w-full text-[10px] px-3 py-2 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 focus:outline-none focus:border-apple-gray focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Explanation section */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="p-5 rounded-apple-md bg-apple-parchment dark:bg-neutral-950 border border-apple-border dark:border-neutral-800 mb-6"
                >
                  <div className="flex items-center gap-1.5 text-neutral-850 dark:text-neutral-350 font-semibold mb-2 text-xs">
                    <HelpCircle size={14} className="text-apple-blue dark:text-apple-sky" />
                    <span>해설 및 오답 분석</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-450">
                    {currentQuestion.explanation || '해당 기출문제의 상세 해설은 준비 중입니다.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-neutral-50/0 dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950/0 p-4 border-t border-neutral-200/20 max-w-md mx-auto flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-apple-border dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed tap-highlight cursor-pointer"
        >
          이전 문제
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-medium tap-highlight transition-all cursor-pointer ${
            isAnswered
              ? 'bg-apple-blue hover:bg-apple-blue/90 text-white'
              : 'bg-neutral-100 dark:bg-neutral-900 border border-apple-border dark:border-neutral-850 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          }`}
        >
          {currentIndex === totalQuestions - 1 ? '결과 보기' : '다음 문제'}
          <ArrowRight size={14} />
        </button>
      </footer>
    </div>
  );
}
