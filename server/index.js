const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

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

app.post('/api/style-image', (req, res) => {
  const { imageDataUrl } = req.body || {};

  res.json({
    imageDataUrl: imageDataUrl || '',
    isMock: true,
    message: 'GPT image backend proxy is ready but real provider is not configured.',
  });
});

app.listen(port, () => {
  console.log(`SpeakSketch backend listening on http://localhost:${port}`);
});
