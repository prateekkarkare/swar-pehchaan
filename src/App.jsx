import React, { useState, useEffect, useCallback } from 'react';
import Home from './components/Home.jsx';
import Settings from './components/Settings.jsx';
import ProgressView from './components/ProgressView.jsx';
import LevelSelect from './modes/swara/LevelSelect.jsx';
import SwaraQuiz from './modes/swara/SwaraQuiz.jsx';
import audioEngine from './engine/AudioEngine.js';
import { getKeyById, DEFAULT_KEY_ID } from './config/keys.js';
import { DEFAULT_INSTRUMENT_ID } from './config/instruments.js';

const PAGES = {
  HOME: 'home',
  LEVEL_SELECT: 'level_select',
  QUIZ: 'quiz',
  PROGRESS: 'progress',
};

const DEFAULT_SETTINGS = {
  keyId: DEFAULT_KEY_ID,
  instrumentId: DEFAULT_INSTRUMENT_ID,
  tanpuraVolume: -12,
  instrumentVolume: -6,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('ear-training-settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings) {
  localStorage.setItem('ear-training-settings', JSON.stringify(settings));
}

export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [audioReady, setAudioReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tanpuraOn, setTanpuraOn] = useState(false);

  // Apply settings to audio engine
  useEffect(() => {
    if (!audioReady) return;
    const key = getKeyById(settings.keyId);
    if (key) audioEngine.setKey(key.hz);
    audioEngine.setInstrument(settings.instrumentId);
    audioEngine.setTanpuraVolume(settings.tanpuraVolume);
    audioEngine.setInstrumentVolume(settings.instrumentVolume);
    persistSettings(settings);
  }, [settings, audioReady]);

  // Init audio on first user interaction
  const initAudio = useCallback(async () => {
    if (audioReady) return;
    await audioEngine.init();
    const key = getKeyById(settings.keyId);
    audioEngine.setKey(key.hz);
    audioEngine.setInstrument(settings.instrumentId);
    audioEngine.setTanpuraVolume(settings.tanpuraVolume);
    audioEngine.setInstrumentVolume(settings.instrumentVolume);
    setAudioReady(true);
  }, [audioReady, settings]);

  // Toggle tanpura
  const toggleTanpura = useCallback(async () => {
    await initAudio();
    if (tanpuraOn) {
      audioEngine.stopTanpura();
      setTanpuraOn(false);
    } else {
      audioEngine.startTanpura();
      setTanpuraOn(true);
    }
  }, [tanpuraOn, initAudio]);

  // Navigation handlers
  const handleSelectMode = useCallback(async (modeId) => {
    await initAudio();
    setSelectedMode(modeId);
    setPage(PAGES.LEVEL_SELECT);
  }, [initAudio]);

  const handleSelectLevel = useCallback(async (level) => {
    await initAudio();
    if (!tanpuraOn) {
      audioEngine.startTanpura();
      setTanpuraOn(true);
    }
    setSelectedLevel(level);
    setPage(PAGES.QUIZ);
  }, [initAudio, tanpuraOn]);

  const handleBackToHome = useCallback(() => {
    audioEngine.stopTanpura();
    audioEngine.stopInstrument();
    setTanpuraOn(false);
    setPage(PAGES.HOME);
    setSelectedMode(null);
    setSelectedLevel(null);
  }, []);

  const handleBackToLevels = useCallback(() => {
    audioEngine.stopTanpura();
    audioEngine.stopInstrument();
    setTanpuraOn(false);
    setPage(PAGES.LEVEL_SELECT);
    setSelectedLevel(null);
  }, []);

  const handleUpdateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="app">
      {/* Top bar */}
      <nav className="top-bar">
        <button className="nav-brand" onClick={handleBackToHome}>
          Swar Sadhana
        </button>
        <div className="nav-actions">
          <button
            className={`btn-tanpura ${tanpuraOn ? 'active' : ''}`}
            onClick={toggleTanpura}
            title={tanpuraOn ? 'Stop Tanpura' : 'Start Tanpura'}
          >
            {tanpuraOn ? '🔊 Tanpura' : '🔇 Tanpura'}
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            className="btn-icon"
            onClick={() => setPage(page === PAGES.PROGRESS ? PAGES.HOME : PAGES.PROGRESS)}
            title="Progress"
          >
            📊
          </button>
        </div>
      </nav>

      {/* Settings sidebar */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-sidebar" onClick={(e) => e.stopPropagation()}>
            <Settings settings={settings} onUpdate={handleUpdateSettings} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="main-content">
        {page === PAGES.HOME && (
          <Home onSelectMode={handleSelectMode} />
        )}

        {page === PAGES.LEVEL_SELECT && selectedMode === 'swara' && (
          <LevelSelect onSelectLevel={handleSelectLevel} />
        )}

        {page === PAGES.QUIZ && selectedLevel && (
          <SwaraQuiz
            level={selectedLevel}
            settings={settings}
            onBack={handleBackToLevels}
            onFinish={handleBackToLevels}
          />
        )}

        {page === PAGES.PROGRESS && (
          <ProgressView onBack={handleBackToHome} />
        )}
      </main>
    </div>
  );
}
