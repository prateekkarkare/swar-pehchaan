import React, { useState, useEffect, useCallback, useRef } from 'react';
import audioEngine from '../../engine/AudioEngine.js';
import { generateQuestion, checkAnswer, getPlaybackTiming } from '../../quiz/QuizEngine.js';
import { SHUDDHA_SWARAS } from '../../config/swaras.js';
import { saveSession } from '../../progress/ProgressStore.js';

/**
 * Quiz states
 */
const STATES = {
  READY: 'ready',
  PLAYING_AAROH: 'playing_aaroh',
  PLAYING_QUESTION: 'playing_question',
  AWAITING_ANSWER: 'awaiting_answer',
  SHOWING_RESULT: 'showing_result',
  FINISHED: 'finished',
};

export default function SwaraQuiz({ level, settings, onBack, onFinish }) {
  const [quizState, setQuizState] = useState(STATES.READY);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);
  const questionStartTime = useRef(null);

  const answersNeeded = level.questionCount;

  // Start a new question
  const nextQuestion = useCallback(async () => {
    const question = generateQuestion(level);
    setCurrentQuestion(question);
    setUserAnswer([]);
    setResult(null);

    // Play aaroh if configured
    if (level.playAaroh) {
      setQuizState(STATES.PLAYING_AAROH);
      await audioEngine.playAaroh(0.5, 0.12);
      // Brief pause after aaroh
      await new Promise((r) => setTimeout(r, 600));
    }

    // Play the question swaras
    setQuizState(STATES.PLAYING_QUESTION);
    const timing = getPlaybackTiming(level);
    await audioEngine.playSwaras(question.swaras, timing.noteDuration, timing.gapDuration);

    setQuizState(STATES.AWAITING_ANSWER);
    questionStartTime.current = Date.now();
  }, [level]);

  // Handle swara button click
  const handleSwaraClick = useCallback(
    (swaraId) => {
      if (quizState !== STATES.AWAITING_ANSWER) return;

      // Play the swara so user hears what they picked
      audioEngine.playOneSwara(swaraId, 0.4);

      const newAnswer = [...userAnswer, swaraId];
      setUserAnswer(newAnswer);

      // Check if we have enough answers
      if (newAnswer.length >= answersNeeded) {
        const timeMs = Date.now() - questionStartTime.current;
        const answerResult = checkAnswer(currentQuestion.swaras, newAnswer);

        const questionResult = {
          played: currentQuestion.swaras,
          answered: newAnswer,
          correct: answerResult.correct,
          details: answerResult.details,
          timeMs,
        };

        setResult(questionResult);
        setResults((prev) => [...prev, questionResult]);
        setQuizState(STATES.SHOWING_RESULT);
      }
    },
    [quizState, userAnswer, answersNeeded, currentQuestion],
  );

  // Replay the question swaras
  const handleReplay = useCallback(async () => {
    if (!currentQuestion || quizState !== STATES.AWAITING_ANSWER) return;
    setQuizState(STATES.PLAYING_QUESTION);
    const timing = getPlaybackTiming(level);
    await audioEngine.playSwaras(currentQuestion.swaras, timing.noteDuration, timing.gapDuration);
    setQuizState(STATES.AWAITING_ANSWER);
  }, [currentQuestion, level, quizState]);

  // Move to next question or finish
  const handleNext = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx >= level.totalQuestions) {
      // Session complete
      const allResults = [...results];
      const summary = saveSession({
        mode: 'swara',
        levelId: level.id,
        levelNumber: level.number,
        instrument: settings.instrumentId,
        key: settings.keyId,
        questions: allResults,
      });
      setSessionSummary(summary);
      setQuizState(STATES.FINISHED);
    } else {
      setQuestionIndex(nextIdx);
    }
  }, [questionIndex, level, results, settings]);

  // Auto-start next question when questionIndex changes
  useEffect(() => {
    if (quizState === STATES.READY || (quizState === STATES.SHOWING_RESULT && questionIndex > 0)) {
      // Small delay before next question
      const t = setTimeout(() => nextQuestion(), quizState === STATES.READY ? 0 : 500);
      return () => clearTimeout(t);
    }
  }, [questionIndex]);

  // Start the first question
  const handleStart = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  // ─── Render ────────────────────────────────────────────

  if (quizState === STATES.READY) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <h2>Level {level.number}: {level.name}</h2>
        </div>
        <div className="quiz-ready">
          <p>{level.description}</p>
          <p>{level.totalQuestions} questions · {level.questionCount} swara{level.questionCount > 1 ? 's' : ''} each</p>
          <button className="btn-start" onClick={handleStart}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizState === STATES.FINISHED && sessionSummary) {
    return (
      <div className="quiz-container">
        <div className="quiz-finished">
          <h2>Session Complete!</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{Math.round(sessionSummary.accuracy * 100)}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat">
              <span className="stat-value">{sessionSummary.correctCount}/{sessionSummary.totalQuestions}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(sessionSummary.avgTimeMs / 1000).toFixed(1)}s</span>
              <span className="stat-label">Avg Time</span>
            </div>
          </div>

          <div className="question-review">
            <h3>Review</h3>
            {sessionSummary.questions.map((q, i) => (
              <div key={i} className={`review-item ${q.correct ? 'correct' : 'incorrect'}`}>
                <span className="review-num">Q{i + 1}</span>
                <span className="review-played">Played: {q.played.join(', ')}</span>
                <span className="review-answered">You: {q.answered.join(', ')}</span>
                <span className="review-time">{(q.timeMs / 1000).toFixed(1)}s</span>
                <span className="review-icon">{q.correct ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>

          <div className="finish-actions">
            <button className="btn-primary" onClick={() => {
              setQuizState(STATES.READY);
              setQuestionIndex(0);
              setResults([]);
              setSessionSummary(null);
            }}>
              Play Again
            </button>
            <button className="btn-secondary" onClick={onBack}>
              Back to Levels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-bar-inner" style={{width: `${((questionIndex) / level.totalQuestions) * 100}%`}} />
        </div>
        <span className="quiz-counter">{questionIndex + 1} / {level.totalQuestions}</span>
      </div>

      <div className="quiz-status">
        {quizState === STATES.PLAYING_AAROH && (
          <div className="status-message">
            <div className="pulse-dot" />
            Playing aaroh... Sa Re Ga Ma Pa Dha Ni Sa
          </div>
        )}
        {quizState === STATES.PLAYING_QUESTION && (
          <div className="status-message">
            <div className="pulse-dot active" />
            Listen carefully...
          </div>
        )}
        {quizState === STATES.AWAITING_ANSWER && (
          <div className="status-message">
            Which swara{answersNeeded > 1 ? 's' : ''}?
            {answersNeeded > 1 && (
              <span className="answer-progress">
                {' '}({userAnswer.length}/{answersNeeded})
              </span>
            )}
          </div>
        )}
        {quizState === STATES.SHOWING_RESULT && result && (
          <div className={`status-message result-message ${result.correct ? 'correct' : 'incorrect'}`}>
            {result.correct ? '✓ Correct!' : `✗ It was ${currentQuestion.swaras.join(', ')}`}
            <span className="result-time">{(result.timeMs / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Swara selection buttons */}
      <div className="swara-buttons">
        {SHUDDHA_SWARAS.map((swara) => {
          const isSelected = userAnswer.includes(swara.id);
          const isCorrectAnswer = result && currentQuestion.swaras.includes(swara.id);
          const isWrongPick = result && userAnswer.includes(swara.id) && !currentQuestion.swaras.includes(swara.id);

          let btnClass = 'swara-btn';
          if (quizState === STATES.SHOWING_RESULT) {
            if (isCorrectAnswer) btnClass += ' correct';
            if (isWrongPick) btnClass += ' incorrect';
          } else if (isSelected) {
            btnClass += ' selected';
          }

          return (
            <button
              key={swara.id}
              className={btnClass}
              disabled={quizState !== STATES.AWAITING_ANSWER}
              onClick={() => handleSwaraClick(swara.id)}
            >
              <span className="swara-name">{swara.name}</span>
              <span className="swara-devanagari">{swara.devanagari}</span>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="quiz-actions">
        {quizState === STATES.AWAITING_ANSWER && (
          <button className="btn-replay" onClick={handleReplay}>
            🔁 Replay
          </button>
        )}
        {quizState === STATES.SHOWING_RESULT && (
          <button className="btn-primary" onClick={handleNext}>
            {questionIndex + 1 >= level.totalQuestions ? 'See Results' : 'Next →'}
          </button>
        )}
      </div>

      {/* Running score */}
      <div className="running-score">
        {results.map((r, i) => (
          <span key={i} className={`score-dot ${r.correct ? 'correct' : 'incorrect'}`}>
            {r.correct ? '●' : '○'}
          </span>
        ))}
      </div>
    </div>
  );
}
