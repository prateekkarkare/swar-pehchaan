import React, { useEffect, useState } from 'react';
import {
  getOverallStats,
  getSessionsList,
  getSwaraStats,
} from '../progress/queries.js';
import {
  clearAll,
  activeAdapterName,
  exportAll,
  importAll,
} from '../progress/store.js';
import { getSwaraById } from '../config/swaras.js';

export default function ProgressView({ onBack }) {
  const [overall, setOverall] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [swaraStats, setSwaraStats] = useState([]);
  const [tab, setTab] = useState('swaras');
  const [modeFilter, setModeFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const filter = modeFilter ? { mode: modeFilter } : {};
    const [o, s, ss] = await Promise.all([
      getOverallStats(filter),
      getSessionsList(filter),
      getSwaraStats(filter),
    ]);
    setOverall(o);
    setSessions(s);
    setSwaraStats(ss);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeFilter]);

  const handleClear = async () => {
    if (!window.confirm('Clear all progress data? This cannot be undone.')) return;
    await clearAll();
    await reload();
  };

  const handleExport = async () => {
    const blob = await exportAll();
    const json = JSON.stringify(blob, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `swar-sadhana-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Importing will REPLACE current data. Continue?')) {
      e.target.value = '';
      return;
    }
    try {
      const blob = JSON.parse(await file.text());
      await importAll(blob);
      await reload();
      alert('Import complete.');
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }
    e.target.value = '';
  };

  if (loading || !overall) {
    return (
      <div className="progress-view">
        <div className="progress-header">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <h2>Progress</h2>
        </div>
        <p className="empty-state">Loading…</p>
      </div>
    );
  }

  return (
    <div className="progress-view">
      <div className="progress-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Progress</h2>
        <span className="storage-badge" title={`Storage: ${activeAdapterName()}`}>
          {activeAdapterName() === 'supabase' ? '☁ Cloud' : '💾 Local'}
        </span>
      </div>

      <div className="overall-stats">
        <div className="stat">
          <span className="stat-value">{overall.totalSessions}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-value">{overall.totalQuestions}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {Math.round(overall.avgAccuracy * 100)}%
          </span>
          <span className="stat-label">Avg Accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {overall.avgResponseMs > 0
              ? (overall.avgResponseMs / 1000).toFixed(1) + 's'
              : '-'}
          </span>
          <span className="stat-label">Avg Time</span>
        </div>
      </div>

      <div className="level-filter">
        <button
          className={`filter-btn ${modeFilter === null ? 'active' : ''}`}
          onClick={() => setModeFilter(null)}
        >
          All
        </button>
        <button
          className={`filter-btn ${modeFilter === 'swara' ? 'active' : ''}`}
          onClick={() => setModeFilter('swara')}
        >
          Swara
        </button>
        <button
          className={`filter-btn ${modeFilter === 'custom' ? 'active' : ''}`}
          onClick={() => setModeFilter('custom')}
        >
          Custom
        </button>
      </div>

      <div className="progress-tabs">
        <button
          className={`tab-btn ${tab === 'swaras' ? 'active' : ''}`}
          onClick={() => setTab('swaras')}
        >
          Swara Mastery
        </button>
        <button
          className={`tab-btn ${tab === 'sessions' ? 'active' : ''}`}
          onClick={() => setTab('sessions')}
        >
          Sessions
        </button>
      </div>

      {tab === 'swaras' && (
        <div className="swara-stats-list">
          {swaraStats.length === 0 ? (
            <p className="empty-state">No data yet. Start practicing!</p>
          ) : (
            swaraStats.map((s) => {
              const swara = getSwaraById(s.swara);
              const top = Object.entries(s.confusedWith)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);
              const pct = Math.round(s.accuracy * 100);
              return (
                <div key={s.swara} className="swara-stat-row">
                  <div className="swara-stat-name">
                    <span className="swara-name">{swara?.name || s.swara}</span>
                    <span className="swara-devanagari">{swara?.devanagari}</span>
                  </div>
                  <div className="swara-stat-bar">
                    <div
                      className={`bar-fill ${pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'poor'}`}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="bar-label">
                      {pct}% ({s.correct}/{s.played})
                    </span>
                  </div>
                  {top.length > 0 && (
                    <div className="swara-stat-meta">
                      <span className="confusion-hint">
                        ⚠ confused with{' '}
                        {top
                          .map(
                            ([id, n]) =>
                              `${getSwaraById(id)?.name || id} (${n})`,
                          )
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="session-list">
          {sessions.length === 0 ? (
            <p className="empty-state">No sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="session-card">
                <div className="session-meta">
                  <span className="session-date">
                    {new Date(s.ts).toLocaleDateString()}{' '}
                    {new Date(s.ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="session-level">
                    {s.presetName || s.levelName || s.levelId || 'Session'}
                  </span>
                </div>
                <div className="session-stats">
                  <span
                    className={`session-accuracy ${s.questionAccuracy >= 0.8 ? 'good' : s.questionAccuracy >= 0.5 ? 'ok' : 'poor'}`}
                  >
                    {Math.round(s.questionAccuracy * 100)}%
                  </span>
                  <span className="session-score">
                    {s.correctQuestions}/{s.totalQuestions}
                  </span>
                  <span className="session-time">
                    {(s.avgResponseMs / 1000).toFixed(1)}s avg
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="progress-actions">
        <button className="btn-secondary" onClick={handleExport}>
          ⬇ Export
        </button>
        <label className="btn-secondary file-label">
          ⬆ Import
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
        {overall.totalAttempts > 0 && (
          <button className="btn-danger" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
