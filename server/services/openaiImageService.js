const OpenAI = require('openai');
const { toFile } = require('openai');

const DEFAULT_MODEL = 'gpt-image-1';
const DEFAULT_PROMPT =
  'Turn this voice-drawn structured sketch into a high-quality illustration. Preserve the main elements, spatial relationships, and composition from the original sketch. Do not add unrelated subjects. Improve lighting, color, detail, and overall finish.';

function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function buildImagePrompt({ style, mood, prompt }) {
  const parts = [DEFAULT_PROMPT];

  if (style) {
    parts.push(`Style: ${style}`);
  }

  if (mood) {
    parts.push(`Mood: ${mood}`);
  }

  if (prompt) {
    parts.push(`Additional prompt: ${prompt}`);
  }

  return parts.join('\n');
}

function parseImageDataUrl(imageDataUrl) {
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    throw new Error('imageDataUrl is required');
  }

  const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) {
    throw new Error('imageDataUrl must be a base64 PNG, JPEG, or WebP data URL');
  }

  const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length === 0) {
    throw new Error('imageDataUrl payload is empty');
  }

  return {
    buffer,
    filename: `speaksketch-input.${extension}`,
    mimeType,
  };
}

async function generateStyledImage({ imageDataUrl, style, mood, prompt }) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const inputImage = parseImageDataUrl(imageDataUrl);
  const imageFile = await toFile(inputImage.buffer, inputImage.filename, {
    type: inputImage.mimeType,
  });

  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const response = await client.images.edit({
    model,
    image: imageFile,
    prompt: buildImagePrompt({ style, mood, prompt }),
    size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
    quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
    output_format: 'png',
  });

  const image = response.data?.[0];
  if (!image?.b64_json) {
    throw new Error('OpenAI image response did not include base64 image data');
  }

  return {
    imageDataUrl: `data:image/png;base64,${image.b64_json}`,
    isMock: false,
    provider: 'openai',
  };
}

module.exports = {
  generateStyledImage,
  isOpenAIConfigured,
};
