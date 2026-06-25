import React from 'react';
import { Trophy, Home, RotateCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuizStore } from '../store/useQuizStore';

export default function QuizResult({ results, onBackToHome, onRetry }) {
  const total = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / total) * 100);
  const isPassed = score >= 60; // 60 points usually passes public audit exams

  const { optionNotes, saveOptionNote, wordCorrections, saveWordCorrection } = useQuizStore();

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
              
              {/* O/X 쪼개기 및 단어 치환 복습 폼 */}
              <div className="space-y-3 my-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800">
                {/* 단어 치환 피드백 */}
                <div className="p-3 bg-primary-50/30 dark:bg-slate-950 rounded-xl border border-primary-100/10 space-y-1.5">
                  <div className="text-[10px] font-bold text-primary-700 dark:text-primary-400">🎯 오답 치환 복습 (X 포인트)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="틀린 단어"
                      value={(wordCorrections[q.id] && wordCorrections[q.id].wrongWord) || ''}
                      onChange={(e) => saveWordCorrection(
                        q.id, 
                        e.target.value, 
                        (wordCorrections[q.id] && wordCorrections[q.id].correctWord) || ''
                      )}
                      className="flex-1 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs">➡️</span>
                    <input
                      type="text"
                      placeholder="바른 단어"
                      value={(wordCorrections[q.id] && wordCorrections[q.id].correctWord) || ''}
                      onChange={(e) => saveWordCorrection(
                        q.id, 
                        (wordCorrections[q.id] && wordCorrections[q.id].wrongWord) || '', 
                        e.target.value
                      )}
                      className="flex-1 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 보기 리스트 및 보기별 메모 */}
                {q.options.map((option, oIdx) => {
                  const oNum = oIdx + 1;
                  const isSelected = q.selectedAnswer === oNum;
                  const isCorrectOption = q.answer === oNum;
                  const note = (optionNotes[q.id] && optionNotes[q.id][oNum]) || '';
                  
                  let optStyle = 'text-slate-500 dark:text-slate-400';
                  let badgeText = '';
                  let badgeStyle = '';
                  
                  if (isCorrectOption) {
                    optStyle = 'text-rose-600 dark:text-rose-400 font-bold';
                    badgeText = '오답 지문 (치환됨)';
                    badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
                  } else {
                    optStyle = 'text-emerald-600 dark:text-emerald-400 font-medium';
                    badgeText = '옳은 개념';
                    badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
                  }

                  return (
                    <div key={oIdx} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                        <span className={`leading-relaxed ${optStyle}`}>
                          {oNum}. {option}
                        </span>
                        {badgeText && <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${badgeStyle}`}>{badgeText}</span>}
                        {isSelected && <span className="text-[8px] px-1 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded">내 선택</span>}
                      </div>
                      <input
                        type="text"
                        placeholder={`보기 ${oNum}번 분석 메모...`}
                        value={note}
                        onChange={(e) => saveOptionNote(q.id, oNum, e.target.value)}
                        className="w-full text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      />
                    </div>
                  );
                })}
              </div>

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
