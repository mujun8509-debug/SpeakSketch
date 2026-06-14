const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateStyledImage } = require('./services/imageProviderService');
const {
  isXunfeiConfigured,
  transcribeWithXunfei,
} = require('./services/xunfeiAsrService');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'SpeakSketch backend',
  });
});

app.post('/api/asr', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Audio file is required.',
      provider: 'mock',
      text: '',
      language: 'unknown',
      confidence: 0,
    });
  }

  if (!isXunfeiConfigured()) {
    return res.json({
      text: '',
      language: 'unknown',
      confidence: 0,
      provider: 'mock',
      message: 'Xunfei ASR backend proxy is ready but real provider is not configured.',
    });
  }

  try {
    const result = await transcribeWithXunfei({
      audioBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      languageMode: req.body?.languageMode || 'auto',
    });

    return res.json({
      text: result.text,
      language: result.language,
      confidence: result.confidence,
      provider: 'xunfei',
    });
  } catch (error) {
    console.error('Xunfei ASR failed', error);
    return res.status(502).json({
      error: 'Xunfei ASR failed',
      message: error instanceof Error ? error.message : 'Unknown ASR error',
      provider: 'xunfei',
      text: '',
      language: 'unknown',
      confidence: 0,
    });
  }
});

app.post('/api/style-image', async (req, res) => {
  const { imageDataUrl, style, mood, prompt } = req.body || {};

  try {
    const result = await generateStyledImage({
      imageDataUrl,
      style,
      mood,
      prompt,
    });

    return res.json(result);
  } catch (error) {
    console.error('Seedream image generation failed', error);
    return res.status(502).json({
      error: 'Seedream image generation failed',
      isMock: false,
    });
  }
});

app.listen(port, () => {
  console.log(`SpeakSketch backend listening on http://localhost:${port}`);
});
