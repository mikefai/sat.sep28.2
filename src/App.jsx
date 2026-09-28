import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, ChevronUp,
  Clock3, Eye, EyeOff, Flag, Grid3X3, RotateCcw, X,
} from 'lucide-react'
import { modules, totalQuestions } from './data/questions.js'

const STORAGE_KEY = 'northstar-reading-exam-v1'
const LETTERS = ['A', 'B', 'C', 'D']
const emptyTimes = modules.map((module) => module.minutes * 60)

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function Brand() {
  return <span className="brand">Northstar</span>
}

function Landing({ saved, onStart, onResume }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <span>Independent SAT-style practice</span>
      </header>
      <section className="landing-hero">
        <div className="hero-copy">
          <h1>A demanding Reading &amp; Writing exam. Nothing extra.</h1>
          <p>Two full modules. Fifty-four original questions. Direct prompts, plausible distractors, and an honest post-exam review.</p>
          <div className="hero-actions">
            <button className="button primary large" onClick={onStart}>Begin mock exam <ArrowRight size={18} /></button>
            {saved && saved.phase !== 'results' && (
              <button className="button secondary large" onClick={onResume}>Resume saved exam</button>
            )}
          </div>
          <p className="fine-print">Designed for the 2026 digital SAT format. Not affiliated with or endorsed by College Board.</p>
        </div>
        <div className="exam-outline" aria-label="Exam structure">
          <div className="outline-number">64</div>
          <div className="outline-unit">minutes</div>
          <div className="outline-rule" />
          <div className="outline-row"><span>Module 1</span><strong>27 questions · 32 min</strong></div>
          <div className="outline-row"><span>Intermission</span><strong>Untimed</strong></div>
          <div className="outline-row"><span>Module 2</span><strong>27 questions · 32 min</strong></div>
          <div className="outline-rule" />
          <div className="outline-row total"><span>Total</span><strong>54 questions</strong></div>
        </div>
      </section>
      <section className="principles">
        <article><span>01</span><h2>Hard by design</h2><p>Dense reasoning, subtle distinctions, and answer choices built to reward precision.</p></article>
        <article><span>02</span><h2>Exam-like flow</h2><p>Timed modules, persistent answers, review flags, navigation, and automatic submission.</p></article>
        <article><span>03</span><h2>Useful review</h2><p>See every correct answer and a concise explanation only after you finish.</p></article>
      </section>
    </main>
  )
}

function Instructions({ timed, setTimed, onBack, onBegin }) {
  return (
    <main className="setup-page">
      <header className="simple-header"><Brand /><button className="text-button" onClick={onBack}><X size={18} /> Close</button></header>
      <section className="instructions">
        <p className="section-label">Before you begin</p>
        <h1>Reading and Writing</h1>
        <p className="lede">Each module contains 27 questions. You may move freely within the current module, but you cannot return after submitting it.</p>
        <div className="instruction-list">
          <div><strong>Read precisely.</strong><span>Each question has one best answer. Select an answer even when uncertain.</span></div>
          <div><strong>Manage your time.</strong><span>In timed mode, the module submits automatically when the clock reaches zero.</span></div>
          <div><strong>Mark and return.</strong><span>Use the bookmark control and question navigator to revisit difficult items.</span></div>
          <div><strong>Review at the end.</strong><span>Answers and explanations stay hidden until both modules are complete.</span></div>
        </div>
        <fieldset className="mode-choice">
          <legend>Timing</legend>
          <label className={timed ? 'selected' : ''}>
            <input type="radio" name="timing" checked={timed} onChange={() => setTimed(true)} />
            <Clock3 size={20} /><span><strong>Timed</strong><small>32 minutes per module</small></span>
          </label>
          <label className={!timed ? 'selected' : ''}>
            <input type="radio" name="timing" checked={!timed} onChange={() => setTimed(false)} />
            <EyeOff size={20} /><span><strong>Untimed practice</strong><small>Clock counts up, with no limit</small></span>
          </label>
        </fieldset>
        <button className="button primary large begin-button" onClick={onBegin}>Start Module 1 <ArrowRight size={18} /></button>
      </section>
    </main>
  )
}

function ExamHeader({ moduleIndex, timed, seconds, timerHidden, onToggleTimer, onExit }) {
  const module = modules[moduleIndex]
  const elapsed = timed ? module.minutes * 60 - seconds : seconds
  const progress = timed ? Math.min(100, (elapsed / (module.minutes * 60)) * 100) : 0
  return (
    <header className="exam-header">
      <Brand />
      <div className="module-title">Reading and Writing <span>•</span> Module {moduleIndex + 1} of 2</div>
      <div className="exam-tools">
        <div className={`timer ${seconds < 300 && timed ? 'urgent' : ''}`} aria-live="polite">
          <Clock3 size={18} /> {timerHidden ? '--:--' : formatTime(seconds)}
        </div>
        <button className="header-button" onClick={onToggleTimer}>{timerHidden ? <Eye size={17} /> : <EyeOff size={17} />} {timerHidden ? 'Show' : 'Hide'}</button>
        <button className="header-button" onClick={onExit}>Exit</button>
      </div>
      <div className="time-progress" style={{ width: `${progress}%` }} />
    </header>
  )
}

function QuestionNavigator({ questions, current, answers, marked, onSelect, onClose }) {
  return (
    <div className="navigator" role="dialog" aria-label="Question navigator">
      <div className="navigator-head"><strong>Go to question</strong><button onClick={onClose} aria-label="Close question navigator"><X size={20} /></button></div>
      <div className="number-grid">
        {questions.map((question, index) => (
          <button
            key={question.id}
            className={`${index === current ? 'current' : ''} ${answers[question.id] !== undefined ? 'answered' : ''}`}
            onClick={() => onSelect(index)}
            aria-current={index === current ? 'step' : undefined}
            aria-label={`Question ${index + 1}${marked[question.id] ? ', marked for review' : ''}${answers[question.id] !== undefined ? ', answered' : ''}`}
          >
            {index + 1}{marked[question.id] && <Flag size={10} className="mini-flag" fill="currentColor" />}
          </button>
        ))}
      </div>
      <div className="legend"><span><i className="current-dot" />Current</span><span><i className="answer-dot" />Answered</span><span><Flag size={13} fill="currentColor" />Marked</span></div>
    </div>
  )
}

function ExamScreen({ moduleIndex, questionIndex, answers, marked, timed, seconds, timerHidden, onAnswer, onMark, onMove, onJump, onFinish, onToggleTimer, onExit }) {
  const [navOpen, setNavOpen] = useState(false)
  const module = modules[moduleIndex]
  const question = module.questions[questionIndex]
  const selected = answers[question.id]

  useEffect(() => {
    const handler = (event) => {
      if (event.key >= '1' && event.key <= '4') onAnswer(Number(event.key) - 1)
      if (event.key === 'ArrowRight' && questionIndex < module.questions.length - 1) onMove(1)
      if (event.key === 'ArrowLeft' && questionIndex > 0) onMove(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [module.questions.length, onAnswer, onMove, questionIndex])

  return (
    <div className="exam-shell">
      <ExamHeader {...{ moduleIndex, timed, seconds, timerHidden, onToggleTimer, onExit }} />
      <main className="question-workspace">
        <section className="passage-panel" aria-label="Reading passage">
          <div className="question-meta"><strong>{questionIndex + 1}</strong><span>{question.domain}</span></div>
          <div className="passage-text">{question.passage.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div>
          <p className="source-line">{question.source}</p>
        </section>
        <section className="answer-panel" aria-label={`Question ${questionIndex + 1}`}>
          <p className="skill-label">{question.skill}</p>
          <h1>{question.prompt}</h1>
          <div className="choices" role="radiogroup" aria-label="Answer choices">
            {question.choices.map((choice, index) => (
              <button key={choice} role="radio" aria-checked={selected === index} className={`choice ${selected === index ? 'selected' : ''}`} onClick={() => onAnswer(index)}>
                <span className="choice-letter">{LETTERS[index]}</span><span>{choice}</span>
              </button>
            ))}
          </div>
          <button className={`mark-button ${marked[question.id] ? 'marked' : ''}`} onClick={onMark}>
            <Bookmark size={20} fill={marked[question.id] ? 'currentColor' : 'none'} /> {marked[question.id] ? 'Marked for review' : 'Mark for review'}
          </button>
        </section>
      </main>
      <footer className="exam-footer">
        <button className="footer-question" onClick={() => setNavOpen(!navOpen)}>Question {questionIndex + 1} of {module.questions.length} {navOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
        <button className="nav-trigger" onClick={() => setNavOpen(!navOpen)}><Grid3X3 size={18} /> Go to question</button>
        <div className="prev-next">
          <button className="button secondary" disabled={questionIndex === 0} onClick={() => onMove(-1)}><ArrowLeft size={18} /> Previous</button>
          {questionIndex === module.questions.length - 1
            ? <button className="button primary" onClick={onFinish}>Review module <Flag size={17} /></button>
            : <button className="button primary" onClick={() => onMove(1)}>Next <ArrowRight size={18} /></button>}
        </div>
      </footer>
      {navOpen && <QuestionNavigator questions={module.questions} current={questionIndex} answers={answers} marked={marked} onSelect={(index) => { onJump(index); setNavOpen(false) }} onClose={() => setNavOpen(false)} />}
    </div>
  )
}

function ModuleReview({ moduleIndex, answers, marked, onReturn, onSubmit }) {
  const module = modules[moduleIndex]
  const answered = module.questions.filter((question) => answers[question.id] !== undefined).length
  const markedCount = module.questions.filter((question) => marked[question.id]).length
  return (
    <main className="review-module-page">
      <header className="simple-header"><Brand /><span>Reading and Writing · Module {moduleIndex + 1}</span></header>
      <section className="module-review">
        <p className="section-label">Check your work</p>
        <h1>Module {moduleIndex + 1} review</h1>
        <p>You can return to any question in this module. Once submitted, your answers are final.</p>
        <div className="review-stats"><div><strong>{answered}</strong><span>Answered</span></div><div><strong>{module.questions.length - answered}</strong><span>Unanswered</span></div><div><strong>{markedCount}</strong><span>Marked</span></div></div>
        <div className="review-grid">
          {module.questions.map((question, index) => (
            <button key={question.id} className={answers[question.id] === undefined ? 'unanswered' : ''} onClick={() => onReturn(index)}>
              <span>{index + 1}</span><small>{answers[question.id] === undefined ? 'Unanswered' : LETTERS[answers[question.id]]}</small>{marked[question.id] && <Bookmark size={14} fill="currentColor" />}
            </button>
          ))}
        </div>
        <button className="button primary large submit-module" onClick={onSubmit}>Submit Module {moduleIndex + 1} <ArrowRight size={18} /></button>
      </section>
    </main>
  )
}

function BreakScreen({ onContinue }) {
  return (
    <main className="break-page">
      <Brand />
      <div className="break-content"><span className="break-number">01 / 02</span><h1>Module 1 complete.</h1><p>Take a short break. Your first module is locked, and your second 32-minute module is ready when you are.</p><button className="button primary large" onClick={onContinue}>Begin Module 2 <ArrowRight size={18} /></button></div>
    </main>
  )
}

function calculateResults(answers) {
  const all = modules.flatMap((module) => module.questions)
  const correct = all.filter((question) => answers[question.id] === question.answer).length
  const scaled = Math.round((200 + (correct / totalQuestions) * 600) / 10) * 10
  const domains = [...new Set(all.map((question) => question.domain))].map((domain) => {
    const questions = all.filter((question) => question.domain === domain)
    const score = questions.filter((question) => answers[question.id] === question.answer).length
    return { domain, score, total: questions.length }
  })
  return { all, correct, scaled, domains }
}

function Results({ answers, marked, onReview, onRestart }) {
  const result = useMemo(() => calculateResults(answers), [answers])
  return (
    <main className="results-page">
      <header className="simple-header"><Brand /><span>Score report</span></header>
      <section className="results-hero">
        <div><p className="section-label">Exam complete</p><h1>Your Reading &amp; Writing result</h1><p>This is a practice estimate, not an official College Board score.</p></div>
        <div className="score-block"><strong>{result.scaled}</strong><span>estimated score</span><small>{result.correct} of {totalQuestions} correct</small></div>
      </section>
      <section className="domain-report">
        <h2>Performance by domain</h2>
        {result.domains.map((item) => <div className="domain-row" key={item.domain}><span>{item.domain}</span><div className="domain-track"><i style={{ width: `${(item.score / item.total) * 100}%` }} /></div><strong>{item.score}/{item.total}</strong></div>)}
      </section>
      <section className="result-actions"><button className="button primary large" onClick={onReview}>Review answers <ArrowRight size={18} /></button><button className="button secondary large" onClick={onRestart}><RotateCcw size={18} /> Start over</button></section>
      <p className="fine-print result-note">{Object.keys(marked).filter((key) => marked[key]).length} questions were marked for review.</p>
    </main>
  )
}

function AnswerReview({ answers, marked, onBack }) {
  const all = modules.flatMap((module, moduleIndex) => module.questions.map((question, questionIndex) => ({ ...question, moduleIndex, questionIndex })))
  const [filter, setFilter] = useState('all')
  const [activeId, setActiveId] = useState(all[0].id)
  const shown = all.filter((question) => filter === 'all' || (filter === 'missed' && answers[question.id] !== question.answer) || (filter === 'marked' && marked[question.id]))
  const active = shown.find((question) => question.id === activeId) || shown[0]
  return (
    <main className="answer-review-page">
      <header className="simple-header"><Brand /><button className="text-button" onClick={onBack}><ArrowLeft size={18} /> Score report</button></header>
      <div className="review-layout">
        <aside className="review-sidebar">
          <h1>Answer review</h1>
          <div className="filters">{['all', 'missed', 'marked'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
          <div className="review-question-list">{shown.map((question) => { const correct = answers[question.id] === question.answer; return <button key={question.id} className={active?.id === question.id ? 'active' : ''} onClick={() => setActiveId(question.id)}><span>Module {question.moduleIndex + 1} · Q{question.questionIndex + 1}</span>{correct ? <Check size={17} className="correct-icon" /> : <X size={17} className="wrong-icon" />}</button> })}</div>
        </aside>
        {active ? <section className="review-detail">
          <div className="question-meta"><strong>{active.questionIndex + 1}</strong><span>{active.domain}</span></div>
          <div className="review-passage">{active.passage.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div>
          <h2>{active.prompt}</h2>
          <div className="review-choices">{active.choices.map((choice, index) => <div key={choice} className={`${index === active.answer ? 'correct' : ''} ${answers[active.id] === index && index !== active.answer ? 'wrong' : ''}`}><span>{LETTERS[index]}</span><p>{choice}</p>{index === active.answer && <strong>Correct</strong>}{answers[active.id] === index && index !== active.answer && <strong>Your answer</strong>}</div>)}</div>
          <div className="explanation"><span>Why</span><p>{active.explanation}</p></div>
        </section> : <section className="empty-review"><Flag size={28} /><h2>No questions match this filter.</h2></section>}
      </div>
    </main>
  )
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }) {
  return <div className="modal-backdrop"><div className="modal" role="alertdialog" aria-modal="true"><h2>{title}</h2><p>{body}</p><div><button className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState(loadSaved)
  const [phase, setPhase] = useState('landing')
  const [moduleIndex, setModuleIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(emptyTimes)
  const [timed, setTimed] = useState(true)
  const [timerHidden, setTimerHidden] = useState(false)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [moduleIndex, phase, questionIndex])

  const saveable = ['exam', 'module-review', 'break'].includes(phase)
  useEffect(() => {
    if (saveable) {
      const snapshot = { phase, moduleIndex, questionIndex, answers, marked, timeRemaining, timed }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    }
  }, [answers, marked, moduleIndex, phase, questionIndex, saveable, timeRemaining, timed])

  const submitModule = useCallback(() => {
    if (moduleIndex === 0) {
      setPhase('break')
    } else {
      setPhase('results')
      localStorage.removeItem(STORAGE_KEY)
    }
    setQuestionIndex(0)
  }, [moduleIndex])

  useEffect(() => {
    if (phase !== 'exam') return undefined
    const interval = window.setInterval(() => {
      setTimeRemaining((current) => {
        const next = [...current]
        if (timed) {
          if (next[moduleIndex] <= 1) {
            window.clearInterval(interval)
            window.setTimeout(submitModule, 0)
            next[moduleIndex] = 0
          } else next[moduleIndex] -= 1
        } else next[moduleIndex] += 1
        return next
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [moduleIndex, phase, submitModule, timed])

  const startFresh = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSavedSnapshot(null)
    setAnswers({}); setMarked({}); setTimeRemaining(emptyTimes); setModuleIndex(0); setQuestionIndex(0); setTimed(true); setPhase('instructions')
  }
  const resume = () => {
    if (!savedSnapshot) return
    setAnswers(savedSnapshot.answers || {}); setMarked(savedSnapshot.marked || {}); setTimeRemaining(savedSnapshot.timeRemaining || emptyTimes); setModuleIndex(savedSnapshot.moduleIndex || 0); setQuestionIndex(savedSnapshot.questionIndex || 0); setTimed(savedSnapshot.timed ?? true); setPhase(savedSnapshot.phase || 'exam')
  }
  const currentQuestion = modules[moduleIndex].questions[questionIndex]
  const selectAnswer = useCallback((index) => setAnswers((current) => ({ ...current, [currentQuestion.id]: index })), [currentQuestion.id])
  const finishPrompt = () => setPhase('module-review')
  const requestSubmit = () => setConfirm({ title: `Submit Module ${moduleIndex + 1}?`, body: 'You will not be able to return to this module after submitting it.', confirmLabel: 'Submit module', action: submitModule })

  return (
    <>
      {phase === 'landing' && <Landing saved={savedSnapshot} onStart={startFresh} onResume={resume} />}
      {phase === 'instructions' && <Instructions timed={timed} setTimed={setTimed} onBack={() => setPhase('landing')} onBegin={() => setPhase('exam')} />}
      {phase === 'exam' && <ExamScreen moduleIndex={moduleIndex} questionIndex={questionIndex} answers={answers} marked={marked} timed={timed} seconds={timeRemaining[moduleIndex]} timerHidden={timerHidden} onAnswer={selectAnswer} onMark={() => setMarked((current) => ({ ...current, [currentQuestion.id]: !current[currentQuestion.id] }))} onMove={(delta) => setQuestionIndex((current) => current + delta)} onJump={setQuestionIndex} onFinish={finishPrompt} onToggleTimer={() => setTimerHidden((current) => !current)} onExit={() => setConfirm({ title: 'Leave the exam?', body: 'Your answers and remaining time are saved on this device.', confirmLabel: 'Save and exit', action: () => { setSavedSnapshot(loadSaved()); setPhase('landing') } })} />}
      {phase === 'module-review' && <ModuleReview moduleIndex={moduleIndex} answers={answers} marked={marked} onReturn={(index) => { setQuestionIndex(index); setPhase('exam') }} onSubmit={requestSubmit} />}
      {phase === 'break' && <BreakScreen onContinue={() => { setModuleIndex(1); setQuestionIndex(0); setPhase('exam') }} />}
      {phase === 'results' && <Results answers={answers} marked={marked} onReview={() => setPhase('answer-review')} onRestart={startFresh} />}
      {phase === 'answer-review' && <AnswerReview answers={answers} marked={marked} onBack={() => setPhase('results')} />}
      {confirm && <ConfirmDialog {...confirm} onConfirm={() => { confirm.action(); setConfirm(null) }} onCancel={() => setConfirm(null)} />}
    </>
  )
}
