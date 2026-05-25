# Swar Sadhana — Hindustani Ear Training

A browser-based ear training app for **Hindustani (North Indian) classical music**. Practice identifying swaras (notes) by ear, with a real recorded tanpura drone and a synthesized harmonium playing each question.

Built with **Vite + React + Tone.js**.

---

## Features

- 🎵 **Swara recognition quizzes** with progressive levels (single swara, pairs, …).
- 🪕 **Sample-based tanpura drone** using real recordings, gapless-looped, pitch-shifted to your chosen Sa.
- 🎹 **Synthesized harmonium** (additive partials, multiple reed banks, breath noise, bellows LFO) for question playback.
- 🎚️ **Selectable keys** — C, C#, D (more easy to add).
- 📈 **Progress tracking** stored in `localStorage`.
- ⚙️ **Config-driven** — add levels, swaras, keys, and instruments by editing plain JS objects, no UI rewiring.

---

## Quick Start

### Prerequisites

- **Node.js ≥ 18** (Vite 6 requirement)
- **npm** (or pnpm / yarn — adjust commands accordingly)

### Install & run

```bash
git clone <this-repo-url>
cd EarTraining
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a modern browser (Chrome, Firefox, Safari, Edge).

> The first click anywhere on the page is required to unlock the Web Audio context — this is a browser policy, not a bug.

### Always-on public URL

This repo is set up to deploy for free on **GitHub Pages**.

Once Pages is enabled, every push to `main` will automatically build and publish the app at:

```text
https://prateekkarkare.github.io/swar-pehchaan/
```

If you rename the repo, update the `VITE_BASE_PATH` value in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Production build

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve dist/ locally to verify
```

The contents of `dist/` can be hosted on any static server (GitHub Pages, Netlify, Vercel, S3, nginx, …). No backend is required.

---

## Free Deploy With GitHub Pages

This is the simplest no-cost setup for a public repo.

### One-time GitHub setup

1. Push this repo to GitHub.
2. Open the repo on GitHub.
3. Go to `Settings` → `Pages`.
4. Under `Build and deployment`, choose `GitHub Actions` as the source.
5. Push to `main`.

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) will build the app and publish it automatically.

### What the pipeline does

- Triggers on every push to `main`
- Installs dependencies with `npm ci`
- Builds the Vite app with the correct Pages base path
- Publishes the generated `dist/` folder to GitHub Pages

### Local production-equivalent build

```bash
VITE_BASE_PATH=/swar-pehchaan/ npm run build
```

That matches what the GitHub Actions deploy job does.

### Make it feel like an app

After deployment:

1. Open the GitHub Pages URL in Chrome or Edge.
2. Use `Install app` if the browser offers it, or `Create shortcut` / `Add to Dock`.
3. Enable `Open as window` if available.

That gives you a desktop-launchable app-like window without running a dev server.

---

## How to Use

1. Pick the **Swara Recognition** mode on the home screen.
2. Choose a **level** (start with Level 1: Single Swara).
3. The tanpura drone starts automatically. The harmonium plays an **aaroh** (Sa Re Ga Ma Pa Dha Ni Sa') as a reference, then the **question swara**.
4. Click the swara button you think you heard. After each answer you'll see whether it was correct.
5. Use the ⚙️ settings panel to change **key** (C / C# / D) and **volumes**.
6. The 📊 progress view shows your accuracy across sessions.

---

## Project Structure

```
src/
├── App.jsx                    # Top-level navigation + tanpura lifecycle
├── main.jsx                   # React entry point
├── config/
│   ├── swaras.js              # Swara definitions (Sa, Re, Ga, …) + frequency math
│   ├── levels.js              # Level configs (swara pool, question count, timing)
│   └── keys.js                # Available keys (C3, C#3, D3 …)
├── engine/
│   ├── AudioEngine.js         # Singleton coordinating tanpura + instrument
│   ├── TanpuraEngine.js       # Sample-based drone with pitch shift
│   └── instruments/
│       └── Harmonium.js       # Additive-synth harmonium
├── quiz/
│   └── QuizEngine.js          # Question generation + answer checking
├── progress/
│   └── ProgressStore.js       # localStorage-backed session log
├── modes/swara/
│   └── SwaraQuiz.jsx          # Quiz screen state machine
├── components/                # Home, LevelSelect, Settings, ProgressView
└── styles/index.css

public/
└── audio/tanpura/             # C.ogg, D.ogg — recorded tanpura loops
```

---

## Adding Content

The app is intentionally config-driven so you can extend it without touching the engine.

### Add a level

Edit `src/config/levels.js`:

```js
{
  id: 'swara-l3',
  number: 3,
  name: 'Three Swaras',
  description: 'Identify three shuddha swaras',
  swaraPool: SHUDDHA_SWARAS_WITH_HIGH_SA.map((s) => s.id),
  questionCount: 3,
  totalQuestions: 10,
  randomTiming: false,
  noteDuration: 1.0,
  gapDuration: 0.3,
  playAaroh: true,
},
```

### Add a key

Edit `src/config/keys.js` and append `{ id, label, baseSaHz }`.

### Add a tanpura sample

1. Record / source a **clean, looping** tanpura at a known Sa.
2. Trim a 20–30s clean middle section, mono, **OGG Vorbis** (`-c:a libvorbis -q:a 4`). MP3 will introduce gap on loop — don't use it.
3. Verify there's no silence with `ffmpeg -af silencedetect`.
4. Save to `public/audio/tanpura/<NAME>.ogg`.
5. Add an entry to the `SAMPLES` array in `src/engine/TanpuraEngine.js` with the sample's true Sa frequency in Hz.

The engine picks the nearest sample and pitch-shifts via `playbackRate`, so two or three well-spaced samples cover many keys.

### Add an instrument

Implement a class in `src/engine/instruments/` exposing `init()`, `playNote(freq, dur, time?)`, `playSequence(notes, gap, startTime?)`, `setVolume(db)`, `stopAll()`, `dispose()`. Register it in `instruments/index.js`.

---

## Audio Credits

- **Tanpura samples**: from Freesound pack [9600 — Electronic Tanpura by sankalp](https://freesound.org/people/sankalp/packs/9600/), licensed **CC BY 4.0**. Trimmed and re-encoded to OGG for gapless looping. Attribution is preserved here.
- **Harmonium**: synthesized in-browser via Tone.js (no samples).

---

## Tech Stack

| Layer    | Library         |
|----------|-----------------|
| Bundler  | Vite 6          |
| UI       | React 19        |
| Audio    | Tone.js 15      |
| Storage  | `localStorage`  |

No backend. No analytics. All audio runs locally in the browser.

---

## Browser Notes

- Web Audio requires a user gesture before audio can start — the app handles this on first click.
- Safari may need an extra moment to load the OGG samples on first start.
- Mobile browsers work, but use headphones for accurate pitch perception.

---

## License

Code: MIT (see `LICENSE` if present, otherwise treat as MIT).
Tanpura audio: CC BY 4.0 — attribution to **sankalp** on Freesound.

---

## Contributing

Issues and PRs welcome. The codebase is small and well-commented; start with `src/App.jsx` and follow the imports.
