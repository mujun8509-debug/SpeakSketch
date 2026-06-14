# SpeakSketch Backend Proxy

This directory contains the backend proxy for SpeakSketch.

The current implementation keeps ASR mock-only and supports an optional OpenAI image provider:
- `/api/asr` accepts audio upload fields but does not call Xunfei ASR yet.
- `/api/style-image` returns Mock output when `OPENAI_API_KEY` is not configured.
- `/api/style-image` calls OpenAI Image API when a valid `OPENAI_API_KEY` is configured in `server/.env`.

OpenAI image generation is an optional backend enhancement. It does not affect the structured drawing flow. Local verification has covered Mock mode and controlled error handling; real generation must be tested by the user after configuring a valid backend key.

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

Example:

```env
PORT=3001

# OpenAI image generation key, backend only
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1

# Xunfei ASR credentials, backend only, used in future PR
XUNFEI_APP_ID=
XUNFEI_API_KEY=
XUNFEI_API_SECRET=
```

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

When `OPENAI_API_KEY` is not configured, the endpoint returns the original `imageDataUrl`:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": true,
  "message": "OpenAI image backend provider is not configured. Mock mode returned the original image."
}
```

When a valid `OPENAI_API_KEY` is configured in `server/.env`, the endpoint calls OpenAI Image API and returns:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": false,
  "provider": "openai"
}
```

If generation fails, the endpoint returns a controlled error response:

```json
{
  "error": "OpenAI image generation failed",
  "isMock": false
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
- The frontend should only call `VITE_IMAGE_API_URL=http://localhost:3001/api/style-image`.
- Real OpenAI image generation may incur API costs.
- Do not claim real OpenAI generation has been fully verified unless a valid key was configured and the request completed successfully.
