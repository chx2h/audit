import React, { useState, useEffect } from 'react';
import { useQuizStore } from './store/useQuizStore';
import Home from './pages/Home';
import QuizSession from './pages/QuizSession';
import QuizResult from './pages/QuizResult';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'quiz' | 'result'
  const [quizParams, setQuizParams] = useState(null); // { type, value, count }
  const [results, setResults] = useState([]);
  
  const { initTheme, fetchQuestions } = useQuizStore();

  // Initialize theme and fetch questions from storage/API on mount
  useEffect(() => {
    initTheme();
    fetchQuestions();
  }, [initTheme, fetchQuestions]);

  const handleStartQuiz = (params) => {
    setQuizParams(params);
    setView('quiz');
  };

  const handleFinishQuiz = (quizResults) => {
    setResults(quizResults);
    setView('result');
  };

  const handleBackToHome = () => {
    setView('home');
    setQuizParams(null);
  };

  const handleRetryQuiz = () => {
    setView('quiz');
  };

  // Animation configuration
  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: 'easeInOut' }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" {...pageTransition}>
            <Home onStartQuiz={handleStartQuiz} />
          </motion.div>
        )}

        {view === 'quiz' && quizParams && (
          <motion.div key="quiz" {...pageTransition}>
            <QuizSession
              sessionType={quizParams.type}
              sessionValue={quizParams.value}
              count={quizParams.count}
              onBackToHome={handleBackToHome}
              onFinish={handleFinishQuiz}
            />
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div key="result" {...pageTransition}>
            <QuizResult
              results={results}
              onBackToHome={handleBackToHome}
              onRetry={handleRetryQuiz}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
