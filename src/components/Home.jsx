import React from 'react';
import MODES from '../modes/registry.js';
import { getStats } from '../progress/ProgressStore.js';

export default function Home({ onSelectMode }) {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>Swar Sadhana</h1>
        <p className="subtitle">Hindustani Music Ear Training</p>
      </div>

      <div className="mode-cards">
        {MODES.map((mode) => {
          const stats = getStats({ mode: mode.id });
          const isAvailable = mode.id === 'swara'; // Only swara mode active for now
          return (
            <button
              key={mode.id}
              className={`mode-card ${!isAvailable ? 'disabled' : ''}`}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectMode(mode.id)}
            >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-name">{mode.name}</span>
              <span className="mode-desc">{mode.description}</span>
              {stats.totalSessions > 0 && (
                <span className="mode-stats">
                  {stats.totalSessions} sessions · {Math.round(stats.avgAccuracy * 100)}% avg
                </span>
              )}
              {!isAvailable && <span className="coming-soon">Coming Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
