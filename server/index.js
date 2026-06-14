const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateStyledImage } = require('./services/imageProviderService');

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

app.post('/api/asr', upload.single('audio'), (req, res) => {
  res.json({
    text: '',
    language: 'unknown',
    confidence: 0,
    provider: 'mock',
    message: 'Xunfei ASR backend proxy is ready but real provider is not configured.',
  });
});

app.post('/api/style-image', async (req, res) => {
  const {
    imageDataUrl,
    style,
    mood,
    prompt,
    semanticPrompt,
    sceneDescription,
    actionSummary,
  } = req.body || {};

  try {
    const result = await generateStyledImage({
      imageDataUrl,
      style,
      mood,
      prompt,
      semanticPrompt,
      sceneDescription,
      actionSummary,
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
