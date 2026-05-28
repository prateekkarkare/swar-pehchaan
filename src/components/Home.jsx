import React, { useEffect, useState } from 'react';
import MODES from '../modes/registry.js';
import { getOverallStats } from '../progress/queries.js';

export default function Home({ onSelectMode }) {
  const [statsByMode, setStatsByMode] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        MODES.map(async (m) => [m.id, await getOverallStats({ mode: m.id })]),
      );
      if (!cancelled) setStatsByMode(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Swar Sadhana</h1>
        <p className="subtitle">Hindustani Music Ear Training</p>
      </div>

      <div className="mode-cards">
        {MODES.map((mode) => {
          const stats = statsByMode[mode.id];
          const isAvailable = mode.available !== false;
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
              {stats && stats.totalSessions > 0 && (
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
