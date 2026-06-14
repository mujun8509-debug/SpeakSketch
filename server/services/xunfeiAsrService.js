const crypto = require('crypto');

const DEFAULT_ASR_URL = 'wss://iat-api.xfyun.cn/v2/iat';
const FRAME_SIZE = 1280;
const FRAME_DELAY_MS = 40;
const REQUEST_TIMEOUT_MS = 45000;

function normalizeAsrUrl(value) {
  const raw = (value || DEFAULT_ASR_URL).trim();
  return raw.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, '').trim();
}

function getXunfeiConfig() {
  return {
    appId: process.env.XUNFEI_APP_ID,
    apiKey: process.env.XUNFEI_API_KEY,
    apiSecret: process.env.XUNFEI_API_SECRET,
    asrUrl: normalizeAsrUrl(process.env.XUNFEI_ASR_URL),
  };
}

function isXunfeiConfigured() {
  const config = getXunfeiConfig();
  return Boolean(config.appId && config.apiKey && config.apiSecret);
}

function buildAuthorizedUrl(config) {
  const endpoint = new URL(config.asrUrl);
  const date = new Date().toUTCString();
  const signatureOrigin = [
    `host: ${endpoint.host}`,
    `date: ${date}`,
    `GET ${endpoint.pathname} HTTP/1.1`,
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', config.apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  const authorizationOrigin = [
    `api_key="${config.apiKey}"`,
    'algorithm="hmac-sha256"',
    'headers="host date request-line"',
    `signature="${signature}"`,
  ].join(', ');

  endpoint.searchParams.set(
    'authorization',
    Buffer.from(authorizationOrigin).toString('base64')
  );
  endpoint.searchParams.set('date', date);
  endpoint.searchParams.set('host', endpoint.host);

  return endpoint.toString();
}

function readAscii(buffer, offset, length) {
  return buffer.subarray(offset, offset + length).toString('ascii');
}

function parseWavAudio(buffer) {
  if (
    buffer.length < 44 ||
    readAscii(buffer, 0, 4) !== 'RIFF' ||
    readAscii(buffer, 8, 4) !== 'WAVE'
  ) {
    throw new Error('Invalid WAV audio file');
  }

  let offset = 12;
  let fmt = null;
  let pcmData = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = readAscii(buffer, offset, 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    const nextOffset = dataOffset + chunkSize + (chunkSize % 2);

    if (dataOffset + chunkSize > buffer.length) {
      break;
    }

    if (chunkId === 'fmt ') {
      fmt = {
        audioFormat: buffer.readUInt16LE(dataOffset),
        channels: buffer.readUInt16LE(dataOffset + 2),
        sampleRate: buffer.readUInt32LE(dataOffset + 4),
        bitsPerSample: buffer.readUInt16LE(dataOffset + 14),
      };
    }

    if (chunkId === 'data') {
      pcmData = buffer.subarray(dataOffset, dataOffset + chunkSize);
    }

    offset = nextOffset;
  }

  if (!fmt || !pcmData) {
    throw new Error('WAV audio is missing fmt or data chunk');
  }

  if (fmt.audioFormat !== 1 || fmt.bitsPerSample !== 16 || fmt.channels !== 1) {
    throw new Error('Xunfei ASR requires 16-bit mono PCM WAV audio');
  }

  if (![8000, 16000].includes(fmt.sampleRate)) {
    throw new Error('Xunfei ASR requires 8000Hz or 16000Hz WAV audio');
  }

  return {
    audioBuffer: pcmData,
    format: `audio/L16;rate=${fmt.sampleRate}`,
    encoding: 'raw',
  };
}

function prepareAudioInput(audioBuffer, mimeType) {
  const normalizedMime = (mimeType || '').toLowerCase();
  const looksLikeWav =
    normalizedMime.includes('wav') ||
    (audioBuffer.length >= 12 &&
      readAscii(audioBuffer, 0, 4) === 'RIFF' &&
      readAscii(audioBuffer, 8, 4) === 'WAVE');

  if (looksLikeWav) {
    return parseWavAudio(audioBuffer);
  }

  if (
    normalizedMime.includes('l16') ||
    normalizedMime.includes('pcm') ||
    normalizedMime.includes('octet-stream')
  ) {
    return {
      audioBuffer,
      format: 'audio/L16;rate=16000',
      encoding: 'raw',
    };
  }

  throw new Error(
    `Unsupported audio format "${mimeType || 'unknown'}". Xunfei ASR expects 16k mono WAV/PCM audio.`
  );
}

function buildBusinessParams(languageMode) {
  if (languageMode === 'en') {
    return {
      language: 'en_us',
      domain: 'iat',
      vad_eos: 5000,
    };
  }

  return {
    language: 'zh_cn',
    domain: 'iat',
    accent: 'mandarin',
    vad_eos: 5000,
  };
}

function buildFrame({ status, chunk, config, business, audioMeta }) {
  const frame = {
    data: {
      status,
      format: audioMeta.format,
      encoding: audioMeta.encoding,
      audio: chunk.toString('base64'),
    },
  };

  if (status === 0) {
    frame.common = {
      app_id: config.appId,
    };
    frame.business = business;
  }

  return frame;
}

function extractText(result) {
  const segments = result?.ws || [];
  return segments
    .map((segment) => (segment.cw || []).map((candidate) => candidate.w || '').join(''))
    .join('');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamAudioFrames(ws, config, business, audioMeta) {
  const chunks = [];
  for (let offset = 0; offset < audioMeta.audioBuffer.length; offset += FRAME_SIZE) {
    chunks.push(audioMeta.audioBuffer.subarray(offset, offset + FRAME_SIZE));
  }

  if (chunks.length === 0) {
    chunks.push(Buffer.alloc(0));
  }

  for (let index = 0; index < chunks.length; index += 1) {
    const isFirst = index === 0;
    const isLast = index === chunks.length - 1;
    const status = isFirst ? 0 : isLast ? 2 : 1;

    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error('Xunfei ASR WebSocket closed before audio upload completed');
    }

    ws.send(
      JSON.stringify(
        buildFrame({
          status,
          chunk: chunks[index],
          config,
          business,
          audioMeta,
        })
      )
    );

    await sleep(FRAME_DELAY_MS);
  }

  if (chunks.length === 1) {
    ws.send(
      JSON.stringify(
        buildFrame({
          status: 2,
          chunk: Buffer.alloc(0),
          config,
          business,
          audioMeta,
        })
      )
    );
  }
}

async function parseMessagePayload(data) {
  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  if (data instanceof ArrayBuffer) {
    return JSON.parse(Buffer.from(data).toString('utf8'));
  }

  if (Buffer.isBuffer(data)) {
    return JSON.parse(data.toString('utf8'));
  }

  if (data && typeof data.text === 'function') {
    return JSON.parse(await data.text());
  }

  return JSON.parse(String(data));
}

async function transcribeWithXunfei({ audioBuffer, mimeType, languageMode }) {
  const config = getXunfeiConfig();

  if (!isXunfeiConfigured()) {
    throw new Error('Xunfei ASR credentials are not configured');
  }

  if (typeof WebSocket === 'undefined') {
    throw new Error('Current Node.js runtime does not provide WebSocket support');
  }

  const audioMeta = prepareAudioInput(audioBuffer, mimeType);
  const business = buildBusinessParams(languageMode);
  const authUrl = buildAuthorizedUrl(config);

  return new Promise((resolve, reject) => {
    let settled = false;
    let transcript = '';
    const ws = new WebSocket(authUrl);

    const finish = (error, value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // Ignore close errors while resolving the request.
      }
      if (error) {
        reject(error);
        return;
      }
      resolve({
        text: value.trim(),
        language: languageMode === 'en' ? 'en' : 'zh',
        confidence: value.trim() ? 0.9 : 0,
      });
    };

    const timeout = setTimeout(() => {
      finish(new Error('Xunfei ASR request timed out'));
    }, REQUEST_TIMEOUT_MS);

    ws.addEventListener('open', () => {
      streamAudioFrames(ws, config, business, audioMeta).catch((error) => {
        finish(error);
      });
    });

    ws.addEventListener('message', (event) => {
      parseMessagePayload(event.data)
        .then((payload) => {
          if (payload.code !== 0) {
            finish(
              new Error(
                `Xunfei ASR error ${payload.code}: ${payload.message || 'unknown error'}`
              )
            );
            return;
          }

          const text = extractText(payload.data?.result);
          if (text) {
            transcript += text;
          }

          if (payload.data?.status === 2) {
            finish(null, transcript);
          }
        })
        .catch((error) => {
          finish(error);
        });
    });

    ws.addEventListener('error', () => {
      finish(new Error('Xunfei ASR WebSocket error'));
    });

    ws.addEventListener('close', (event) => {
      if (!settled && event.code !== 1000) {
        finish(new Error(`Xunfei ASR WebSocket closed with code ${event.code}`));
      }
    });
  });
}

module.exports = {
  isXunfeiConfigured,
  transcribeWithXunfei,
};
