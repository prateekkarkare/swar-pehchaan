import React from 'react';
import { KEYS, DEFAULT_KEY_ID } from '../config/keys.js';
import INSTRUMENTS, { DEFAULT_INSTRUMENT_ID } from '../config/instruments.js';

export default function Settings({ settings, onUpdate }) {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>

      <div className="setting-group">
        <label htmlFor="key-select">Key (Sa =)</label>
        <select
          id="key-select"
          value={settings.keyId}
          onChange={(e) => onUpdate({ ...settings, keyId: e.target.value })}
        >
          {KEYS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label} ({k.hz} Hz)
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="instrument-select">Instrument</label>
        <select
          id="instrument-select"
          value={settings.instrumentId}
          onChange={(e) => onUpdate({ ...settings, instrumentId: e.target.value })}
        >
          {INSTRUMENTS.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.icon} {inst.name}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="tanpura-vol">Tanpura Volume</label>
        <input
          id="tanpura-vol"
          type="range"
          min="-30"
          max="0"
          value={settings.tanpuraVolume}
          onChange={(e) => onUpdate({ ...settings, tanpuraVolume: Number(e.target.value) })}
        />
      </div>

      <div className="setting-group">
        <label htmlFor="inst-vol">Instrument Volume</label>
        <input
          id="inst-vol"
          type="range"
          min="-30"
          max="0"
          value={settings.instrumentVolume}
          onChange={(e) => onUpdate({ ...settings, instrumentVolume: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
