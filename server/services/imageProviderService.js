const { generateWithSeedream } = require('./seedreamImageService');

async function generateStyledImage(params) {
  if (!process.env.SEEDREAM_API_KEY) {
    return {
      imageDataUrl: params.imageDataUrl,
      isMock: true,
      provider: 'mock',
      message: 'SEEDREAM_API_KEY is not configured. Using mock mode.',
    };
  }

  return generateWithSeedream(params);
}

module.exports = { generateStyledImage };
