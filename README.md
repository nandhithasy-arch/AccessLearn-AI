# AccessLearn AI — Frontend

React + Vite + Tailwind. Routes match the 8 screens in the project spec
(section 11): Landing, Dashboard, Upload, Processing, Analysis,
Transform, Comparison, Reader, Export.

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`; `/api/*` requests are proxied to the
FastAPI backend on `http://localhost:8000` (see `vite.config.js`).

## Notes for whoever picks this up (Person 1)

- `src/api/client.js` is the only place that talks to the backend — add
  new calls there, not inline `fetch`s in pages.
- Every page is wired to the real backend now (see `STATUS.md`, Stage 2).
  `POST /documents/upload`, `GET /documents`, `GET /documents/{id}`,
  `POST /documents/{id}/analyze` (PDF only), `GET /documents/{id}/issues`,
  and `DELETE /documents/{id}` are fully implemented, so Upload → Processing
  → Analysis → Dashboard work end-to-end against a real PDF today.
  `POST /documents/{id}/transform` and `POST /documents/{id}/validate`
  still correctly `501` (the AI-backed services behind them, plus the
  semantic-extraction wiring `/transform` depends on, aren't built yet) —
  that's the next stage, not a frontend bug. Build/keep the error states
  on Transform/Comparison working against that `501` until then.
- The Reader page (`src/pages/Reader.jsx`) is the one screen explicitly
  called out in the spec as needing to be accessible itself: font size,
  line spacing, high contrast, browser TTS via `speechSynthesis`, and a
  toggle back to the original are all wired, just against placeholder
  content until `/transform` and `/validate` are real.
- Global focus-visible outline and a skip-to-content link are in `App.jsx`
  / `index.css` — keep both if you restyle.
