# SpeakSketch Backend Proxy

This directory contains the backend proxy for SpeakSketch.

The current implementation keeps ASR mock-only and supports an optional Seedream image-to-image provider:
- `/api/asr` accepts audio upload fields but does not call Xunfei ASR yet.
- `/api/style-image` returns Mock output when `SEEDREAM_API_KEY` is not configured.
- `/api/style-image` calls Seedream 5.0 image-to-image API when a valid `SEEDREAM_API_KEY` is configured in `server/.env`.

Seedream image generation is an optional backend enhancement. It does not affect the structured drawing flow. Local verification covers Mock mode and controlled error handling; real generation requires a valid backend key and may incur provider costs.

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

SEEDREAM_API_KEY=
SEEDREAM_API_URL=
SEEDREAM_MODEL=seedream-5.0

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

When `SEEDREAM_API_KEY` is not configured, the endpoint returns the original `imageDataUrl`:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": true,
  "provider": "mock",
  "message": "SEEDREAM_API_KEY is not configured. Using mock mode."
}
```

When a valid `SEEDREAM_API_KEY` is configured in `server/.env`, the endpoint sends the current canvas image as the image-to-image input and returns:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": false,
  "provider": "seedream"
}
```

If generation fails, the endpoint returns a controlled error response:

```json
{
  "error": "Seedream image generation failed",
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
- Keep Seedream API keys only in `server/.env`.
- Never commit real `.env` files.
- The frontend must not store or send provider API keys.
- The frontend should only call `VITE_IMAGE_API_URL=http://localhost:3001/api/style-image`.
- Real Seedream image generation may incur API costs.
- Do not claim real Seedream generation has been fully verified unless a valid key was configured and the request completed successfully.
