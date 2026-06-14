const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const {
  generateStyledImage,
  isOpenAIConfigured,
} = require('./services/openaiImageService');

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
  const { imageDataUrl, style, mood, prompt } = req.body || {};

  if (!isOpenAIConfigured()) {
    return res.json({
      imageDataUrl: imageDataUrl || '',
      isMock: true,
      message: 'OpenAI image backend provider is not configured. Mock mode returned the original image.',
    });
  }

  try {
    const result = await generateStyledImage({
      imageDataUrl,
      style,
      mood,
      prompt,
    });

    return res.json(result);
  } catch (error) {
    console.error('OpenAI image generation failed', error);
    return res.status(502).json({
      error: 'OpenAI image generation failed',
      isMock: false,
    });
  }
});

app.listen(port, () => {
  console.log(`SpeakSketch backend listening on http://localhost:${port}`);
});
