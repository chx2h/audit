import React, { useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { 
  BookOpen, Calendar, Award, BookMarked, RefreshCw, Moon, Sun, Play, 
  Plus, Trash2, ExternalLink, GitMerge, Columns, FileText, ChevronDown, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home({ onStartQuiz }) {
  const {
    questions,
    isIntensiveMode,
    toggleIntensiveMode,
    bookmarks,
    wrongAnswers,
    solvedHistory,
    theme,
    toggleTheme,
    clearHistory,
    comparisonTables,
    addComparisonTable,
    deleteComparisonTable,
    mindmapNotes,
    saveMindmapNote
  } = useQuizStore();

  // Active Tab State: 'quiz' | 'study'
  const [activeTab, setActiveTab] = useState('quiz');

  // Comparison Table Builder States
  const [showModal, setShowModal] = useState(false);
  const [tableTitle, setTableTitle] = useState('');
  const [col1, setCol1] = useState('');
  const [col2, setCol2] = useState('');
  const [newRows, setNewRows] = useState([{ attr: '', val1: '', val2: '' }]);

  // Mindmap Node Toggle States
  const [expandedNodes, setExpandedNodes] = useState({});

  // Statistics calculation
  const totalQuestions = questions.length;
  const solvedCount = Object.keys(solvedHistory).length;
  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;
  
  const correctCount = Object.values(solvedHistory).filter(h => h.isCorrect).length;
  const accuracyPercent = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;

  // Extract unique subjects and years
  const subjects = [...new Set(questions.map(q => q.subject))].filter(Boolean);
  const years = [...new Set(questions.map(q => q.year))].filter(Boolean).sort((a, b) => b - a);

  const getSubjectCount = (sub) => questions.filter(q => q.subject === sub).length;
  const getSubjectSolvedCount = (sub) => {
    const subQIds = questions.filter(q => q.subject === sub).map(q => q.id);
    return Object.keys(solvedHistory).filter(id => subQIds.includes(id)).length;
  };

  const handleReset = () => {
    if (window.confirm('모든 학습 기록(풀이 역사, 오답 메모, 대조표)을 초기화하시겠습니까?')) {
      clearHistory();
    }
  };

  // Add a row in Table Builder
  const addBuilderRow = () => {
    setNewRows([...newRows, { attr: '', val1: '', val2: '' }]);
  };

  // Update a row in Table Builder
  const updateBuilderRow = (index, field, value) => {
    const updated = [...newRows];
    updated[index][field] = value;
    setNewRows(updated);
  };

  // Save Comparison Table
  const handleSaveTable = (e) => {
    e.preventDefault();
    if (!tableTitle || !col1 || !col2) {
      alert('모든 제목과 대상 열 이름을 입력해 주세요.');
      return;
    }
    const filteredRows = newRows.filter(r => r.attr || r.val1 || r.val2);
    if (filteredRows.length === 0) {
      alert('최소 1개 이상의 속성 행을 작성해 주세요.');
      return;
    }

    const newTable = {
      id: Date.now().toString(),
      title: tableTitle,
      columns: [col1, col2],
      rows: filteredRows
    };

    addComparisonTable(newTable);
    
    // Reset States
    setTableTitle('');
    setCol1('');
    setCol2('');
    setNewRows([{ attr: '', val1: '', val2: '' }]);
    setShowModal(false);
  };

  // Toggle mindmap nodes
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Mindmap data configuration
  const mindmapData = [
    {
      id: 'se',
      title: '소프트웨어 공학',
      children: [
        {
          id: 'se-test',
          title: '소프트웨어 테스트 기법',
          desc: '블랙박스(동등분할, 경계값) vs 화이트박스(구문, 결정, 조건)',
          keywords: ['동등 분할', '경계값 분석', '문장 커버리지', '조건/결정 커버리지']
        },
        {
          id: 'se-solid',
          title: '객체지향 설계 원칙 (SOLID)',
          desc: 'LSP(리스코프 치환), SRP(단일책임), OCP(개방폐쇄) 등 핵심 5원칙',
          keywords: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP']
        },
        {
          id: 'se-agile',
          title: '애자일 프로그래밍 방법론',
          desc: '고객 중심 점진적 개발 기법 (XP, Scrum, Kanban)',
          keywords: ['XP 5대 가치', '스크럼 스프린트', '일일 스크럼 미팅']
        }
      ]
    },
    {
      id: 'db',
      title: '데이터베이스',
      children: [
        {
          id: 'db-norm',
          title: '데이터베이스 정규화 (Normalization)',
          desc: '이상현상 제거를 위한 테이블 분해 단계 (1NF ~ BCNF)',
          keywords: ['부분함수종속(2NF)', '이행적함수종속(3NF)', '결정자/후보키(BCNF)']
        },
        {
          id: 'db-acid',
          title: '트랜잭션 ACID 성질',
          desc: '트랜잭션의 신뢰성을 보장하는 4대 필수 성질',
          keywords: ['원자성 (Atomicity)', '일관성 (Consistency)', '격리성 (Isolation)', '지속성 (Durability)']
        },
        {
          id: 'db-concurrency',
          title: '동시성 제어 (Concurrency Control)',
          desc: '트랜잭션 병행 제어 및 Locking 프로토콜',
          keywords: ['2단계 잠금 규약 (2-PL)', '교착 상태 (Deadlock)', '공유 잠금/배타 잠금']
        }
      ]
    },
    {
      id: 'pm',
      title: '프로젝트 관리 및 감리',
      children: [
        {
          id: 'pm-schedule',
          title: '일정 관리 기법 (CPM)',
          desc: '주공정선(Critical Path) 및 여유시간(Slack) 연산 구조',
          keywords: ['임계 경로 (Critical Path)', '가장 빠른 개시일 (ES)', '가장 늦은 종료일 (LF)']
        },
        {
          id: 'pm-audit',
          title: '감리원 의무 및 절차',
          desc: '감리 업무 수행의 독립성 및 감리 조치 확인 프로세스',
          keywords: ['객관성 및 독립성', '감리 조치결과 확인', '분석/설계/테스트 단계별 중점사항']
        }
      ]
    }
  ];

  // Curated Guidelines
  const externalGuidelines = [
    {
      title: '정보시스템 감리기준 고시',
      org: '행정안전부 고시 제2023-45호',
      desc: '감리 수행 범위, 감리원 자격, 절차 등의 최신 법적 기준을 담은 원문입니다.',
      url: 'https://www.law.go.kr/행정규칙/정보시스템감리기준'
    },
    {
      title: '전자정부법 및 시행령',
      org: '국가법령정보센터',
      desc: '공공기관 정보화 사업 감리 의무 대상 및 규정을 담은 모법(母法) 조문입니다.',
      url: 'https://www.law.go.kr/법령/전자정부법'
    },
    {
      title: 'SW사업 대가산정 가이드',
      org: '한국소프트웨어산업협회',
      desc: '기능점수(FP) 방식의 산정 단가 및 투입공수(M/M) 대가 산정 기준서입니다.',
      url: 'https://www.sw.or.kr/'
    }
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 font-sans text-[17px] tracking-tight">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
            Pass Bank.
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">High-efficiency study tool for audit exams.</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-neutral-900 border border-apple-border dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 tap-highlight cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Segmented Tab Controls (완벽한 알약 형태) */}
      <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-full mb-6 border border-apple-border dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 text-center text-xs font-medium rounded-full transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-white dark:bg-neutral-900 text-apple-blue dark:text-apple-sky border border-apple-border dark:border-neutral-800'
              : 'text-apple-gray hover:text-neutral-800 dark:hover:text-neutral-300'
          }`}
        >
          기출문제 풀이
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-2 text-center text-xs font-medium rounded-full transition-all cursor-pointer ${
            activeTab === 'study'
              ? 'bg-white dark:bg-neutral-900 text-apple-blue dark:text-apple-sky border border-apple-border dark:border-neutral-800'
              : 'text-apple-gray hover:text-neutral-800 dark:hover:text-neutral-300'
          }`}
        >
          고효율 복습노트
        </button>
      </div>

  {/* Tab Contents: QUIZ */}
  {activeTab === 'quiz' && (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* 집중 암기모드 배너/토글 */}
      <section className="mb-6">
        <div className={`p-4 rounded-apple-lg border transition-all duration-300 ${
          isIntensiveMode 
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
            : 'bg-white dark:bg-neutral-900 border-apple-border dark:border-neutral-800'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <Award size={14} className="animate-pulse" />
                </span>
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  집중 문제 암기 모드
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-mono font-bold scale-90 origin-left">INTENSIVE</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                부정형 기출문제(~가 아닌 것은?)를 긍정형(~맞는 것은?) 3문제로 쪼개어, 헷갈리는 지문을 바로 정답으로 외우는 고효율 암기 기법입니다.
              </p>
            </div>
            <div className="flex items-center h-full pt-1.5">
              <button
                onClick={toggleIntensiveMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer outline-none ${
                  isIntensiveMode ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isIntensiveMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Card Dashboard (그림자 제거, 18px 모서리) */}
      <section className="mb-6">
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-2">My Learning Progress</h2>
            <div className="apple-card rounded-apple-lg p-5">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="text-center p-3 rounded-apple-md bg-apple-pearl dark:bg-neutral-950 border border-apple-border dark:border-neutral-800">
                  <span className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 font-mono block mb-1">PROGRESS</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{progressPercent}%</span>
                  <span className="text-[9px] text-apple-gray dark:text-neutral-500 block mt-1">({solvedCount} / {totalQuestions} Qs)</span>
                </div>
                <div className="text-center p-3 rounded-apple-md bg-apple-pearl dark:bg-neutral-950 border border-apple-border dark:border-neutral-800">
                  <span className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 font-mono block mb-1">ACCURACY</span>
                  <span className="text-2xl font-bold text-apple-blue dark:text-apple-sky">{accuracyPercent}%</span>
                  <span className="text-[9px] text-apple-gray dark:text-neutral-500 block mt-1">({correctCount} correct)</span>
                </div>
              </div>

              {/* Progress bar (bg-apple-blue) */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-4 border border-neutral-200/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-apple-blue h-full rounded-full"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-apple-gray dark:text-neutral-450">
                <span>Bookmarks: {bookmarks.length}</span>
                <span>Wrong Answers: {wrongAnswers.length}</span>
              </div>
            </div>
          </section>

          {/* Quick Play Menu */}
          <section className="mb-6">
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-2">Speed Training</h2>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartQuiz({ type: 'random', count: 10 })}
                className="flex flex-col items-start text-left p-5 rounded-apple-lg bg-apple-blue hover:bg-apple-blue/90 text-white border border-transparent cursor-pointer tap-highlight"
              >
                <div className="p-2 rounded bg-white/10 mb-4 text-white">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="font-semibold text-sm mb-1">랜덤 모의고사</span>
                <span className="text-[10px] opacity-70">무작위 10문항 풀기</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => wrongAnswers.length > 0 && onStartQuiz({ type: 'wrong' })}
                disabled={wrongAnswers.length === 0}
                className={`flex flex-col items-start text-left p-5 rounded-apple-lg border cursor-pointer transition-all tap-highlight ${
                  wrongAnswers.length > 0
                    ? 'bg-white dark:bg-neutral-900 border-red-500/50 hover:bg-red-50/10 text-red-600 dark:text-red-500'
                    : 'bg-neutral-50 dark:bg-neutral-900/30 border-apple-border dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                }`}
              >
                <div className={`p-2 rounded mb-4 ${wrongAnswers.length > 0 ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                  <Award size={16} />
                </div>
                <span className="font-semibold text-sm mb-1">자동 오답 노트</span>
                <span className="text-[10px] opacity-70">{wrongAnswers.length}개 대기 중</span>
              </motion.button>
            </div>
          </section>

          {/* Subjects Section */}
          <section className="mb-6">
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-2">Focus by Subject</h2>
            <div className="space-y-2">
              {subjects.map((sub, idx) => {
                const subCount = getSubjectCount(sub);
                const subSolved = getSubjectSolvedCount(sub);
                const pct = subCount > 0 ? Math.round((subSolved / subCount) * 100) : 0;
                return (
                  <motion.button
                    key={`subject-${sub}-${idx}`}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onStartQuiz({ type: 'subject', value: sub })}
                    className="w-full flex items-center justify-between p-4 apple-card rounded-apple-lg text-left tap-highlight hover:border-apple-gray dark:hover:border-neutral-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-apple-pearl dark:bg-neutral-950 border border-apple-border dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-800 dark:text-neutral-100 text-xs">{sub}</h3>
                        <p className="text-[10px] text-apple-gray dark:text-neutral-500 mt-0.5 font-mono">
                          {subSolved} / {subCount} Solved ({pct}%)
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200/10">
                      <div className="bg-apple-blue h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Years Section */}
          <section className="mb-6">
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-2">Solved by Year</h2>
            <div className="grid grid-cols-2 gap-3">
              {years.map((year, idx) => (
                <motion.button
                  key={`year-${year}-${idx}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartQuiz({ type: 'year', value: year })}
                  className="flex items-center justify-between p-4 apple-card rounded-apple-lg hover:border-apple-gray dark:hover:border-neutral-700 cursor-pointer tap-highlight"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-apple-pearl dark:bg-neutral-950 border border-apple-border dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                      <Calendar size={14} />
                    </div>
                    <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200">{year}년 기출</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Bookmarks Section */}
          <section className="mb-10">
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-2">Bookmarks</h2>
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => bookmarks.length > 0 && onStartQuiz({ type: 'bookmark' })}
              disabled={bookmarks.length === 0}
              className={`w-full flex items-center justify-between p-4 rounded-apple-lg border transition-all ${
                bookmarks.length > 0
                  ? 'bg-white dark:bg-neutral-900 border-apple-border dark:border-neutral-800 hover:border-apple-gray dark:hover:border-neutral-700 cursor-pointer tap-highlight'
                  : 'bg-neutral-50 dark:bg-neutral-900/30 border-apple-border dark:border-neutral-800/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${bookmarks.length > 0 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                  <BookMarked size={16} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 text-xs">북마크 문제만 풀기</h3>
                  <p className="text-[10px] text-apple-gray dark:text-neutral-500 mt-0.5 font-mono">Total {bookmarks.length} bookmarked</p>
                </div>
              </div>
            </motion.button>
          </section>

          {/* Reset Area */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs text-red-500 hover:underline opacity-80 cursor-pointer font-mono"
            >
              <RefreshCw size={10} />
              RESET STUDY RECORDS
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Contents: STUDY (고효율 복습노트) */}
      {activeTab === 'study' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-8"
        >
          {/* 1. Comparison Tables (비교 분석 대조표) */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono">Contrast Tables</h2>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-apple-blue px-3 py-1.5 rounded-full hover:bg-apple-blue/90 tap-highlight cursor-pointer"
              >
                <Plus size={12} />
                대조표 추가
              </button>
            </div>

            {comparisonTables.length === 0 ? (
              <div className="text-center p-8 bg-white dark:bg-neutral-900 border border-dashed border-apple-border dark:border-neutral-800 rounded-apple-lg text-neutral-400 dark:text-neutral-500">
                <Columns className="mx-auto mb-2 opacity-40" size={24} />
                <p className="text-xs font-semibold text-neutral-500">저장된 비교표가 없습니다.</p>
                <p className="text-[10px] opacity-80 mt-1">NAS vs SAN 처럼 헷갈리는 기술을 등록해 보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comparisonTables.map((table) => (
                  <div
                    key={table.id}
                    className="apple-card rounded-apple-lg p-4 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-3 pr-8">
                      <h3 className="font-semibold text-xs text-neutral-950 dark:text-white">{table.title}</h3>
                      <button
                        onClick={() => deleteComparisonTable(table.id)}
                        className="absolute right-3 top-3 text-red-500 dark:text-red-400 p-1 hover:bg-neutral-50 dark:hover:bg-neutral-950/30 rounded tap-highlight cursor-pointer"
                        aria-label="Delete table"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-apple-border dark:border-neutral-800 rounded-apple-md">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-apple-pearl dark:bg-neutral-950 text-apple-gray dark:text-neutral-400 border-b border-apple-border dark:border-neutral-800 font-mono">
                            <th className="py-2 px-3 font-medium text-[10px] uppercase">비교 항목</th>
                            <th className="py-2 px-3 font-medium text-[10px] uppercase">{table.columns[0]}</th>
                            <th className="py-2 px-3 font-medium text-[10px] uppercase">{table.columns[1]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-neutral-100 dark:border-neutral-800/50 text-neutral-700 dark:text-neutral-300"
                            >
                              <td className="py-2 px-3 font-medium bg-apple-pearl/40 dark:bg-neutral-950/30 border-r border-apple-border dark:border-neutral-800">{row.attr}</td>
                              <td className="py-2 px-3 leading-relaxed border-r border-apple-border dark:border-neutral-800">{row.val1}</td>
                              <td className="py-2 px-3 leading-relaxed">{row.val2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. State Guidelines Link Center (고시 가이드라인 센터) */}
          <section>
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-3">Guidelines & Regulations</h2>
            <div className="grid grid-cols-1 gap-3">
              {externalGuidelines.map((guide, idx) => (
                <a
                  key={idx}
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between p-4 apple-card rounded-apple-lg hover:border-apple-gray dark:hover:border-neutral-700 transition-colors group"
                >
                  <div className="flex gap-3">
                    <div className="p-2.5 rounded bg-apple-pearl dark:bg-neutral-950 border border-apple-border dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 mt-0.5">
                      <FileText size={16} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-apple-gray dark:text-neutral-500 font-mono block mb-0.5">{guide.org}</span>
                      <h3 className="font-semibold text-xs text-neutral-950 dark:text-white group-hover:text-apple-blue dark:group-hover:text-apple-sky transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-[11px] text-apple-gray dark:text-neutral-400 mt-1 leading-relaxed">{guide.desc}</p>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-neutral-300 dark:text-neutral-700 flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </section>

          {/* 3. Mindmap Keyword Chain (마인드맵 백지 복습) */}
          <section>
            <h2 className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono mb-3">Mindmap Blanks</h2>
            <div className="space-y-3">
              {mindmapData.map((category) => (
                <div
                  key={category.id}
                  className="apple-card rounded-apple-lg overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleNode(category.id)}
                    className="w-full flex items-center justify-between p-4 bg-apple-pearl/60 dark:bg-neutral-950/20 font-semibold text-xs text-neutral-800 dark:text-neutral-200 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GitMerge size={14} className="text-apple-blue dark:text-apple-sky" />
                      <span>{category.title}</span>
                    </div>
                    {expandedNodes[category.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {/* Children Nodes */}
                  <AnimatePresence>
                    {expandedNodes[category.id] && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-apple-border dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/50"
                      >
                        {category.children.map((child) => (
                          <div key={child.id} className="p-4 space-y-3">
                            <div>
                              <h4 className="font-semibold text-xs text-neutral-850 dark:text-neutral-200">{child.title}</h4>
                              <p className="text-[10px] text-apple-gray dark:text-neutral-500 mt-0.5 leading-relaxed">{child.desc}</p>
                            </div>

                            {/* Keywords Grid & Personal Blank Notes */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {child.keywords.map((kw, kwIdx) => (
                                  <span
                                    key={kwIdx}
                                    className="text-[9px] px-2 py-0.5 rounded-full bg-apple-pearl dark:bg-neutral-800 border border-apple-border dark:border-neutral-800/40 text-neutral-600 dark:text-neutral-400 font-mono"
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>

                              <textarea
                                placeholder="백지에 복습한 암기 내용을 요약 기재해 보세요. (예: 특징, 핵심 키워드 관계)"
                                value={mindmapNotes[child.id] || ''}
                                onChange={(e) => saveMindmapNote(child.id, e.target.value)}
                                rows={2}
                                className="w-full text-xs p-3 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 focus:outline-none focus:border-apple-gray focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      )}

      {/* 4. Comparison Table Builder Modal (비교 분석표 모달) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs">
            <motion.form
              onSubmit={handleSaveTable}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-apple-lg rounded-b-none shadow-2xl p-6 border-t border-l border-r border-apple-border dark:border-neutral-800 overflow-y-auto max-h-[85vh] safe-padding-bottom"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white font-display">새 비교 대조표 생성</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-apple-blue dark:text-apple-sky hover:underline cursor-pointer"
                >
                  닫기
                </button>
              </div>

              {/* Title & Columns */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono block mb-1">비교표 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="예: NAS vs SAN"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className="w-full text-xs p-3 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono block mb-1">대상 열 1</label>
                    <input
                      type="text"
                      required
                      placeholder="예: NAS"
                      value={col1}
                      onChange={(e) => setCol1(e.target.value)}
                      className="w-full text-xs p-3 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono block mb-1">대상 열 2</label>
                    <input
                      type="text"
                      required
                      placeholder="예: SAN"
                      value={col2}
                      onChange={(e) => setCol2(e.target.value)}
                      className="w-full text-xs p-3 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                    />
                  </div>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-3 mb-6">
                <label className="text-[10px] font-bold text-apple-gray dark:text-neutral-500 uppercase tracking-widest font-mono block">비교 속성 및 상세 내용</label>
                <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                  {newRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="속성 (예: 비용)"
                        value={row.attr}
                        onChange={(e) => updateBuilderRow(idx, 'attr', e.target.value)}
                        className="text-[10px] p-2.5 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                      />
                      <input
                        type="text"
                        placeholder={`${col1 || '대상1'} 값`}
                        value={row.val1}
                        onChange={(e) => updateBuilderRow(idx, 'val1', e.target.value)}
                        className="text-[10px] p-2.5 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                      />
                      <input
                        type="text"
                        placeholder={`${col2 || '대상2'} 값`}
                        value={row.val2}
                        onChange={(e) => updateBuilderRow(idx, 'val2', e.target.value)}
                        className="text-[10px] p-2.5 rounded-apple-sm border border-apple-border dark:border-neutral-800 bg-apple-pearl/40 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-apple-gray"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addBuilderRow}
                  className="w-full py-2 bg-apple-pearl dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-apple-border dark:border-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 rounded-full transition-all tap-highlight cursor-pointer font-display"
                >
                  속성 행 추가
                </button>
              </div>

              {/* Save Trigger */}
              <button
                type="submit"
                className="w-full py-3.5 bg-apple-blue hover:bg-apple-blue/90 text-white text-xs font-bold rounded-full shadow-sm tap-highlight transition-all cursor-pointer font-display"
              >
                비교 대조표 저장
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
