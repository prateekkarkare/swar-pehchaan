import React, { useEffect, useState } from 'react';
import LEVELS from '../../config/levels.js';
import { getOverallStats } from '../../progress/queries.js';

export default function LevelSelect({ onSelectLevel }) {
  const [statsByLevel, setStatsByLevel] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        LEVELS.map(async (l) => [
          l.id,
          await getOverallStats({ mode: 'swara', levelId: l.id }),
        ]),
      );
      if (!cancelled) setStatsByLevel(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="level-select">
      <h2>Choose a Level</h2>
      <div className="level-cards">
        {LEVELS.map((level) => {
          const stats = statsByLevel[level.id];
          return (
            <button
              key={level.id}
              className="level-card"
              onClick={() => onSelectLevel(level)}
            >
              <div className="level-number">Level {level.number}</div>
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.description}</div>
              {stats && stats.totalSessions > 0 && (
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
