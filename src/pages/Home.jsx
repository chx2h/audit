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
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="text-primary-600 dark:text-primary-400">패스</span> 문제은행
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">감리 시험 대비 고효율 학습 앱</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 tap-highlight"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Segmented Tab Controls */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'quiz'
              ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          기출문제 풀이
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'study'
              ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          고효율 복습노트 ⭐
        </button>
      </div>

      {/* Tab Contents: QUIZ */}
      {activeTab === 'quiz' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Stats Card Dashboard */}
          <section className="mb-6">
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
          <section className="mb-6">
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
          <section className="mb-6">
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
          <section className="mb-6">
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
        </motion.div>
      )}

      {/* Tab Contents: STUDY (고효율 복습노트) */}
      {activeTab === 'study' && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {/* 1. Comparison Tables (비교 분석 대조표) */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">나만의 비교 분석표</h2>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2.5 py-1.5 rounded-lg tap-highlight"
              >
                <Plus size={14} />
                대조표 추가
              </button>
            </div>

            {comparisonTables.length === 0 ? (
              <div className="text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600">
                <Columns className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-xs font-semibold">저장된 비교표가 없습니다.</p>
                <p className="text-[10px] opacity-80 mt-1">NAS vs SAN 처럼 헷갈리는 기술을 등록해 보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comparisonTables.map((table) => (
                  <div
                    key={table.id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-3 pr-8">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{table.title}</h3>
                      <button
                        onClick={() => deleteComparisonTable(table.id)}
                        className="absolute right-3 top-3 text-rose-500 dark:text-rose-400 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg tap-highlight"
                        aria-label="Delete table"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="py-2 px-3 font-semibold">비교 항목</th>
                            <th className="py-2 px-3 font-semibold">{table.columns[0]}</th>
                            <th className="py-2 px-3 font-semibold">{table.columns[1]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-slate-50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300"
                            >
                              <td className="py-2 px-3 font-bold bg-slate-50/50 dark:bg-slate-800/10">{row.attr}</td>
                              <td className="py-2 px-3 leading-relaxed">{row.val1}</td>
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
            <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">가이드라인 & 법조문 원문 정독</h2>
            <div className="grid grid-cols-1 gap-3">
              {externalGuidelines.map((guide, idx) => (
                <a
                  key={idx}
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-primary-400 transition-colors group"
                >
                  <div className="flex gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mt-0.5">
                      <FileText size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-0.5">{guide.org}</span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{guide.desc}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 dark:text-slate-700 flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </section>

          {/* 3. Mindmap Keyword Chain (마인드맵 백지 복습) */}
          <section>
            <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">키워드 꼬리물기 (백지 복습)</h2>
            <div className="space-y-4">
              {mindmapData.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleNode(category.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold text-sm text-slate-800 dark:text-slate-200 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <GitMerge size={16} className="text-primary-600 dark:text-primary-400" />
                      <span>{category.title}</span>
                    </div>
                    {expandedNodes[category.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {/* Children Nodes */}
                  <AnimatePresence>
                    {expandedNodes[category.id] && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-50 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800/50"
                      >
                        {category.children.map((child) => (
                          <div key={child.id} className="p-4 space-y-3">
                            <div>
                              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{child.title}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{child.desc}</p>
                            </div>

                            {/* Keywords Grid & Personal Blank Notes */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {child.keywords.map((kw, kwIdx) => (
                                  <span
                                    key={kwIdx}
                                    className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
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
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
            <motion.form
              onSubmit={handleSaveTable}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl rounded-b-xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[85vh] safe-padding-bottom"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">새 비교 대조표 생성</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  닫기
                </button>
              </div>

              {/* Title & Columns */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">비교표 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="예: NAS vs SAN"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">대상 열 1</label>
                    <input
                      type="text"
                      required
                      placeholder="예: NAS"
                      value={col1}
                      onChange={(e) => setCol1(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">대상 열 2</label>
                    <input
                      type="text"
                      required
                      placeholder="예: SAN"
                      value={col2}
                      onChange={(e) => setCol2(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-3 mb-6">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block">비교 속성 및 상세 내용</label>
                <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                  {newRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="속성 (예: 비용)"
                        value={row.attr}
                        onChange={(e) => updateBuilderRow(idx, 'attr', e.target.value)}
                        className="text-[10px] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                      />
                      <input
                        type="text"
                        placeholder={`${col1 || '대상1'} 값`}
                        value={row.val1}
                        onChange={(e) => updateBuilderRow(idx, 'val1', e.target.value)}
                        className="text-[10px] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                      />
                      <input
                        type="text"
                        placeholder={`${col2 || '대상2'} 값`}
                        value={row.val2}
                        onChange={(e) => updateBuilderRow(idx, 'val2', e.target.value)}
                        className="text-[10px] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addBuilderRow}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 rounded-xl transition-all tap-highlight"
                >
                  속성 행 추가
                </button>
              </div>

              {/* Save Trigger */}
              <button
                type="submit"
                className="w-full py-3.5 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-primary-500/10 tap-highlight transition-all"
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
