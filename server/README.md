# SpeakSketch Backend Proxy

This directory contains the minimal backend proxy scaffold for SpeakSketch.

The current implementation is intentionally mock-only:
- `/api/asr` accepts audio upload fields but does not call Xunfei ASR yet.
- `/api/style-image` accepts image generation fields but does not call OpenAI yet.
- Real provider integrations should be added in later pull requests.

## Install

```bash
cd server
npm install
```

## Configure

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Do not commit a real `.env` file. Provider credentials must stay on the backend.

## Start

```bash
npm run dev
```

The backend defaults to `http://localhost:3001`.

## API

### GET `/api/health`

Returns:

```json
{
  "ok": true,
  "service": "SpeakSketch backend"
}
```

### POST `/api/asr`

Accepts `multipart/form-data`:
- `audio`: audio file
- `languageMode`: `auto`, `zh`, or `en`

Current mock response:

```json
{
  "text": "",
  "language": "unknown",
  "confidence": 0,
  "provider": "mock",
  "message": "Xunfei ASR backend proxy is ready but real provider is not configured."
}
```

### POST `/api/style-image`

Accepts JSON:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "style": "动漫化",
  "mood": "清新校园",
  "prompt": "..."
}
```

Current mock response returns the original `imageDataUrl`:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": true,
  "message": "GPT image backend proxy is ready but real provider is not configured."
}
```

## Frontend Environment

The frontend `.env` should only point to backend URLs:

```env
VITE_ASR_API_URL=http://localhost:3001/api/asr
VITE_IMAGE_API_URL=http://localhost:3001/api/style-image
```

## Security Notes

- Keep Xunfei APPID, APIKey, and APISecret only in `server/.env`.
- Keep OpenAI API keys only in `server/.env`.
- Never commit real `.env` files.
- The frontend must not store or send provider API keys.
