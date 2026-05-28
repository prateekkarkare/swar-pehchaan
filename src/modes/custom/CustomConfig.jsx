import React, { useState, useMemo } from 'react';
import { PRESETS, CUSTOM_PRESET_ID, poolHash } from '../../config/presets.js';
import { SWARAS, getSwaraById } from '../../config/swaras.js';

const SWARA_ORDER = [
  'Sa',
  're',
  'Re',
  'ga',
  'Ga',
  'Ma',
  'ma',
  'Pa',
  'dha',
  'Dha',
  'ni',
  'Ni',
  "Sa'",
];

export default function CustomConfig({ onStart, onBack }) {
  const [presetId, setPresetId] = useState('yaman');
  const [customSwaras, setCustomSwaras] = useState(['Sa', 'Re', 'Ga', 'Pa', "Sa'"]);
  const [questionCount, setQuestionCount] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const activeSwaras = useMemo(() => {
    if (presetId === CUSTOM_PRESET_ID) return customSwaras;
    const p = PRESETS.find((x) => x.id === presetId);
    return p ? p.swaras : [];
  }, [presetId, customSwaras]);

  const presetName = useMemo(() => {
    if (presetId === CUSTOM_PRESET_ID) return 'Custom';
    return PRESETS.find((x) => x.id === presetId)?.name || presetId;
  }, [presetId]);

  const toggleSwara = (id) => {
    setCustomSwaras((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const canStart =
    activeSwaras.length >= Math.max(questionCount, 1) && questionCount >= 1;

  const handleStart = () => {
    if (!canStart) return;
    const level = {
      id: `custom-${presetId}-${questionCount}`,
      number: questionCount,
      name:
        questionCount === 1
          ? `${presetName} — Single Note`
          : `${presetName} — ${questionCount} Notes`,
      description: `${activeSwaras.length} swaras · ${questionCount} note${questionCount > 1 ? 's' : ''} per question`,
      swaraPool: activeSwaras,
      questionCount,
      totalQuestions,
      randomTiming: false,
      noteDuration: 1.5,
      gapDuration: 0.5,
      playAaroh: true,
      // Custom-mode metadata that flows into attempt ctx:
      mode: 'custom',
      presetId,
      presetName,
      poolHash: poolHash(activeSwaras),
    };
    onStart(level);
  };

  return (
    <div className="custom-config">
      <div className="quiz-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Custom Practice</h2>
      </div>

      <div className="config-section">
        <label className="config-label">Pick a preset</label>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-card ${presetId === p.id ? 'active' : ''}`}
              onClick={() => setPresetId(p.id)}
            >
              <div className="preset-name">{p.name}</div>
              <div className="preset-desc">{p.description}</div>
            </button>
          ))}
          <button
            className={`preset-card ${presetId === CUSTOM_PRESET_ID ? 'active' : ''}`}
            onClick={() => setPresetId(CUSTOM_PRESET_ID)}
          >
            <div className="preset-name">Custom</div>
            <div className="preset-desc">Pick your own swaras</div>
          </button>
        </div>
      </div>

      {presetId === CUSTOM_PRESET_ID && (
        <div className="config-section">
          <label className="config-label">Pick the swaras</label>
          <div className="swara-picker">
            {SWARA_ORDER.map((id) => {
              const s = getSwaraById(id);
              if (!s) return null;
              const active = customSwaras.includes(id);
              return (
                <button
                  key={id}
                  className={`swara-picker-btn ${active ? 'active' : ''} type-${s.type}`}
                  onClick={() => toggleSwara(id)}
                >
                  <span className="swara-name">{s.name}</span>
                  <span className="swara-devanagari">{s.devanagari}</span>
                </button>
              );
            })}
          </div>
          <p className="config-hint">{customSwaras.length} selected</p>
        </div>
      )}

      <div className="config-section">
        <label className="config-label">
          Notes per question: <strong>{questionCount}</strong>
        </label>
        <div className="level-pills">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`level-pill ${questionCount === n ? 'active' : ''}`}
              onClick={() => setQuestionCount(n)}
              disabled={activeSwaras.length < n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="config-section">
        <label className="config-label">
          Questions in session: <strong>{totalQuestions}</strong>
        </label>
        <div className="level-pills">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              className={`level-pill ${totalQuestions === n ? 'active' : ''}`}
              onClick={() => setTotalQuestions(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="config-summary">
        <p>
          <strong>Pool:</strong>{' '}
          {activeSwaras.length === 0
            ? '(none)'
            : activeSwaras.map((id) => getSwaraById(id)?.name).join(' ')}
        </p>
        <p>
          <strong>Question:</strong> {questionCount} note
          {questionCount > 1 ? 's' : ''} per question, {totalQuestions} questions
        </p>
      </div>

      <div className="config-actions">
        <button
          className="btn-start"
          onClick={handleStart}
          disabled={!canStart}
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}
