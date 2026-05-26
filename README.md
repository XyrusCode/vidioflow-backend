# Vidioflow Backend

Automated video demo generator. Records browser sessions via Playwright, synthesizes voiceovers with Microsoft Edge TTS, and merges them into web-ready `.mp4` files using FFmpeg.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- FFmpeg installed and available on `PATH`
- Playwright Chromium (`npx playwright install chromium`)

## Setup

```bash
cp .env.example .env
# Edit .env with your DB credentials

npm install
npx playwright install chromium
npm run start:dev
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/projects` | Create a new project with script and automation steps |
| `GET` | `/projects/:id` | Fetch project details and current status |
| `POST` | `/projects/:id/generate` | Trigger async video generation (returns 202) |

### Create Project — example body

```json
{
  "name": "Product Demo",
  "description": "Walk-through of the login flow",
  "script": {
    "textContent": "Welcome to Acme. Let me show you how easy it is to get started.",
    "voiceModel": "en-US-AriaNeural"
  },
  "steps": [
    { "stepOrder": 1, "actionType": "navigate", "value": "https://example.com" },
    { "stepOrder": 2, "actionType": "click",    "selector": "#login-btn" },
    { "stepOrder": 3, "actionType": "fill",     "selector": "#email", "value": "demo@example.com" },
    { "stepOrder": 4, "actionType": "wait",     "value": "1500" }
  ]
}
```

## Architecture

```
src/
├── app.module.ts               — Root module
├── main.ts                     — Bootstrap
├── config/
│   ├── configuration.ts        — Typed env config
│   └── data-source.ts          — TypeORM CLI data source
├── common/
│   ├── dto/                    — Request/Response DTOs
│   └── enums/                  — ProjectStatus, ActionType
├── database/
│   ├── entities/               — TypeORM entities
│   └── migrations/             — SQL migrations
└── modules/
    ├── projects/               — CRUD + API layer
    ├── automation/             — Playwright headless recording
    ├── tts/                    — Microsoft Edge TTS synthesis
    └── generator/              — Orchestration + FFmpeg merge
```

## Voice Models

Common `voiceModel` values for Edge TTS:
- `en-US-AriaNeural` (default, female)
- `en-US-GuyNeural` (male)
- `en-GB-SoniaNeural`
- `en-AU-NatashaNeural`

## Output

Generated files are written to:
- `/tmp/videos/` — raw Playwright `.webm` recordings
- `/tmp/audio/` — Edge TTS `.mp3` outputs
- `/tmp/output/` — final merged `.mp4` (path stored in `projects.final_video_url`)
