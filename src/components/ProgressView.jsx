import React, { useState } from 'react';
import { getSessions, getStats, clearProgress } from '../progress/ProgressStore.js';
import LEVELS from '../config/levels.js';

export default function ProgressView({ onBack }) {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const overallStats = getStats({ mode: 'swara' });
  const sessions = getSessions({ mode: 'swara', levelId: selectedLevel });

  return (
    <div className="progress-view">
      <div className="progress-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Progress</h2>
      </div>

      {/* Overall stats */}
      <div className="overall-stats">
        <div className="stat">
          <span className="stat-value">{overallStats.totalSessions}</span>
          <span className="stat-label">Total Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(overallStats.avgAccuracy * 100)}%</span>
          <span className="stat-label">Avg Accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {overallStats.avgTimeMs > 0 ? (overallStats.avgTimeMs / 1000).toFixed(1) + 's' : '-'}
          </span>
          <span className="stat-label">Avg Time</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(overallStats.bestAccuracy * 100)}%</span>
          <span className="stat-label">Best Accuracy</span>
        </div>
      </div>

      {/* Level filter */}
      <div className="level-filter">
        <button
          className={`filter-btn ${selectedLevel === null ? 'active' : ''}`}
          onClick={() => setSelectedLevel(null)}
        >
          All
        </button>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={`filter-btn ${selectedLevel === l.id ? 'active' : ''}`}
            onClick={() => setSelectedLevel(l.id)}
          >
            L{l.number}
          </button>
        ))}
      </div>

      {/* Session history */}
      <div className="session-list">
        {sessions.length === 0 ? (
          <p className="empty-state">No sessions yet. Start practicing!</p>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="session-card">
              <div className="session-meta">
                <span className="session-date">
                  {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </span>
                <span className="session-level">Level {s.levelNumber}</span>
              </div>
              <div className="session-stats">
                <span className={`session-accuracy ${s.accuracy >= 0.8 ? 'good' : s.accuracy >= 0.5 ? 'ok' : 'poor'}`}>
                  {Math.round(s.accuracy * 100)}%
                </span>
                <span className="session-score">{s.correctCount}/{s.totalQuestions}</span>
                <span className="session-time">{(s.avgTimeMs / 1000).toFixed(1)}s avg</span>
              </div>
            </div>
          ))
        )}
      </div>

      {overallStats.totalSessions > 0 && (
        <button
          className="btn-danger"
          onClick={() => {
            if (window.confirm('Clear all progress data? This cannot be undone.')) {
              clearProgress();
              setSelectedLevel(null);
            }
          }}
        >
          Clear All Progress
        </button>
      )}
    </div>
  );
}
