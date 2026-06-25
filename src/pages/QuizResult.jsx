import React from 'react';
import { Trophy, Home, RotateCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuizStore } from '../store/useQuizStore';

export default function QuizResult({ results, onBackToHome, onRetry }) {
  const total = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / total) * 100);
  const isPassed = score >= 60; // 60 points usually passes public audit exams

  const { optionNotes, saveOptionNote } = useQuizStore();

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 font-sans text-[17px] tracking-tight">
      {/* Trophy & Main Score */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex p-4 rounded-full bg-apple-blue text-white mb-4 border border-transparent"
        >
          <Trophy size={36} />
        </motion.div>
        
        <h1 className="text-lg font-bold text-neutral-950 dark:text-white mb-1">학습을 완료했습니다.</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Exam session finished. Review the results below.</p>
      </div>

      {/* Score Summary Card (그림자 제거, 18px 모서리) */}
      <section className="apple-card rounded-apple-lg p-6 mb-6 text-center shadow-none">
        <div className="inline-flex relative items-center justify-center mb-5">
          {/* Circular progress visualizer */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-neutral-100 dark:text-neutral-850"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - score / 100) }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={isPassed ? "text-apple-blue dark:text-apple-sky" : "text-red-500"}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-bold text-neutral-950 dark:text-white block font-mono">{score}점</span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">{correctCount} / {total} Correct</span>
          </div>
        </div>

        <div>
          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold font-mono border ${
            isPassed 
              ? 'bg-apple-pearl border-apple-border text-neutral-800 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-250' 
              : 'bg-red-50/10 border-red-500/30 text-red-600 dark:text-red-500'
          }`}>
            {isPassed ? 'PASSED (60점 이상)' : 'FAILED (60점 미만)'}
          </span>
        </div>
      </section>

      {/* Answers Breakdown */}
      <section className="mb-8">
        <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-3">Questions Review</h2>
        <div className="space-y-3">
          {results.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 apple-card rounded-apple-lg shadow-none"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  {q.isCorrect ? (
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-[10px] font-mono font-bold text-apple-gray dark:text-neutral-500">Q{q.no}. {q.subject}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  q.isCorrect 
                    ? 'bg-apple-pearl border-apple-border text-neutral-700 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-350' 
                    : 'bg-red-50/10 border-red-500/20 text-red-600 dark:text-red-500'
                }`}>
                  {q.isCorrect ? 'CORRECT' : 'WRONG'}
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-850 dark:text-neutral-100 mb-2 leading-relaxed">{q.question}</p>
              
              {/* O/X 쪼개기 역추적 학습용 보기별 오답 정리란 */}
              <div className="space-y-2 my-4 pl-3 border-l-2 border-apple-border dark:border-neutral-800">
                {q.options.map((option, oIdx) => {
                  const oNum = oIdx + 1;
                  const isSelected = q.selectedAnswer === oNum;
                  const isCorrectOption = q.answer === oNum;
                  const note = (optionNotes[q.id] && optionNotes[q.id][oNum]) || '';
                  
                  return (
                    <div key={oIdx} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`font-medium leading-relaxed text-[11px] ${
                          isCorrectOption 
                            ? 'text-emerald-655 dark:text-emerald-400 font-bold' 
                            : isSelected 
                              ? 'text-red-600 dark:text-red-400 font-bold' 
                              : 'text-neutral-500 dark:text-neutral-450'
                        }`}>
                          {oNum}. {option}
                        </span>
                        {isCorrectOption && <span className="text-[9px] font-mono px-1 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full bg-emerald-500/5">정답</span>}
                        {isSelected && !isCorrectOption && <span className="text-[9px] font-mono px-1 border border-red-500/30 text-red-600 dark:text-red-400 rounded-full bg-red-500/5">내 선택</span>}
                      </div>
                      <input
                        type="text"
                        placeholder={`보기 ${oNum}번 역추적 분석 메모...`}
                        value={note}
                        onChange={(e) => saveOptionNote(q.id, oNum, e.target.value)}
                        className="w-full text-[10px] px-2.5 py-1.5 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-350 focus:outline-none focus:border-apple-gray focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                      />
                    </div>
                  );
                })}
              </div>

              <details className="mt-2 group">
                <summary className="text-[10px] font-mono text-apple-gray dark:text-neutral-550 cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
                  <HelpCircle size={12} className="text-apple-blue dark:text-apple-sky" />
                  <span>EXPLANATION</span>
                </summary>
                <p className="text-xs leading-relaxed text-neutral-550 dark:text-neutral-400 mt-2 bg-apple-parchment dark:bg-neutral-950 p-3 rounded-apple-sm border border-apple-border dark:border-neutral-800">
                  {q.explanation || '해당 기출문제의 상세 해설은 준비 중입니다.'}
                </p>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Sticky CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-neutral-50/0 dark:from-neutral-950 dark:via-neutral-950/95 dark:to-neutral-950/0 p-4 border-t border-neutral-200/20 max-w-md mx-auto flex items-center justify-between gap-4">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-apple-border dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-semibold tap-highlight cursor-pointer"
        >
          <RotateCcw size={14} />
          다시 풀기
        </button>

        <button
          onClick={onBackToHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-semibold tap-highlight cursor-pointer"
        >
          <Home size={14} />
          홈으로 가기
        </button>
      </footer>
    </div>
  );
}
