# SpeakSketch Backend Proxy

This directory contains the backend proxy for SpeakSketch.

The current implementation supports optional backend providers for Xunfei ASR and Seedream image-to-image:
- `/api/asr` returns Mock output when Xunfei credentials are not configured.
- `/api/asr` calls Xunfei IAT WebSocket when valid `XUNFEI_APP_ID`, `XUNFEI_API_KEY`, and `XUNFEI_API_SECRET` are configured in `server/.env`.
- `/api/style-image` returns Mock output when `SEEDREAM_API_KEY` is not configured.
- `/api/style-image` calls Seedream 5.0 image-to-image API when a valid `SEEDREAM_API_KEY` is configured in `server/.env`.

Cloud ASR and Seedream image generation are optional backend enhancements. They do not affect the structured drawing flow. The frontend never stores provider keys. Real provider calls require valid backend credentials and may incur provider costs.

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
XUNFEI_ASR_URL=wss://iat-api.xfyun.cn/v2/iat
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

When Xunfei credentials are not configured, the endpoint returns Mock output:

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

When valid Xunfei credentials are configured, the endpoint proxies the uploaded audio to Xunfei IAT and returns:

```json
{
  "text": "draw a blue rectangle",
  "language": "en",
  "confidence": 0.9,
  "provider": "xunfei"
}
```

The browser client converts recorded audio to 16k mono WAV before uploading. Direct API callers should upload 16-bit mono WAV/PCM audio.

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
