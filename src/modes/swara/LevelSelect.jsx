import React from 'react';
import LEVELS from '../../config/levels.js';
import { getStats } from '../../progress/ProgressStore.js';

export default function LevelSelect({ onSelectLevel }) {
  return (
    <div className="level-select">
      <h2>Choose a Level</h2>
      <div className="level-cards">
        {LEVELS.map((level) => {
          const stats = getStats({ mode: 'swara', levelId: level.id });
          return (
            <button
              key={level.id}
              className="level-card"
              onClick={() => onSelectLevel(level)}
            >
              <div className="level-number">Level {level.number}</div>
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.description}</div>
              {stats.totalSessions > 0 && (
                <div className="level-stats">
                  <span>{Math.round(stats.avgAccuracy * 100)}% avg</span>
                  <span>{stats.totalSessions} sessions</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
