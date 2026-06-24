import React from 'react';
import { Trophy, Home, RotateCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuizResult({ results, onBackToHome, onRetry }) {
  const total = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / total) * 100);
  const isPassed = score >= 60; // 60 points usually passes public audit exams

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24">
      {/* Trophy & Main Score */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex p-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg mb-4"
        >
          <Trophy size={48} />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">학습을 완료했습니다!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">수고하셨습니다. 결과는 아래와 같습니다.</p>
      </div>

      {/* Score Summary Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6 text-center">
        <div className="inline-flex relative items-center justify-center mb-4">
          {/* Circular progress visualizer */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 54}
              initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - score / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={isPassed ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-slate-950 dark:text-white block">{score}점</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{correctCount} / {total} 맞춤</span>
          </div>
        </div>

        <div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            isPassed 
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            {isPassed ? '합격 안정권 (60점 이상)' : '재학습 필요 (60점 미만)'}
          </span>
        </div>
      </section>

      {/* Answers Breakdown */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">문항 리뷰</h2>
        <div className="space-y-3">
          {results.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {q.isCorrect ? (
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-rose-500 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Q{q.no}. {q.subject}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  q.isCorrect 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                }`}>
                  {q.isCorrect ? '정답' : '오답'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug">{q.question}</p>
              
              {!q.isCorrect && (
                <div className="text-xs text-rose-600 dark:text-rose-400 mb-2">
                  내가 고른 답: {q.selectedAnswer || '미선택'} (정답: {q.answer})
                </div>
              )}
              
              <details className="mt-2 group">
                <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
                  <HelpCircle size={12} />
                  <span>해설 펼쳐보기</span>
                </summary>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {q.explanation}
                </p>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Sticky CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-slate-50/0 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950/0 p-4 border-t border-slate-200/20 max-w-md mx-auto flex items-center justify-between gap-4">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold tap-highlight shadow-sm"
        >
          <RotateCcw size={16} />
          다시 풀기
        </button>

        <button
          onClick={onBackToHome}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary-600 dark:bg-primary-500 text-white text-sm font-semibold shadow-md shadow-primary-500/10 tap-highlight"
        >
          <Home size={16} />
          홈으로 가기
        </button>
      </footer>
    </div>
  );
}
