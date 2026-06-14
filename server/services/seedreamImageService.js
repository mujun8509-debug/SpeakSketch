const DEFAULT_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const DEFAULT_MODEL = 'seedream-5.0';
const DEFAULT_SIZE = '2K';

function parseDataUrl(imageDataUrl) {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid imageDataUrl');

  return {
    mimeType: match[1],
    base64: match[2],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function formatActionSummary(actionSummary) {
  if (!Array.isArray(actionSummary) || actionSummary.length === 0) {
    return '';
  }

  return actionSummary
    .slice(0, 24)
    .map((action) => {
      const label = action.label || action.type || '未知元素';
      const position = action.position ? `，位置：${action.position}` : '';
      const count = action.count ? `，数量：${action.count}` : '';
      return `${label}${position}${count}`;
    })
    .join('；');
}

function buildSeedreamPrompt({
  style,
  mood,
  prompt,
  semanticPrompt,
  sceneDescription,
  actionSummary,
}) {
  const formattedActionSummary = formatActionSummary(actionSummary);

  return [
    '请将输入图片转化为指定艺术风格。',
    '这是一张由结构化绘图工具生成的简笔草图，部分图形较抽象，请结合语义说明理解画面。',
    '必须使用输入图片作为图生图参考，不要生成与原图无关的新画面。',
    '保留原始画面中的主要物体、空间关系、位置和构图。',
    '将抽象符号解释为对应真实物体，例如鸟、云、太阳、船、海平面、树、人物、猫、汽车等。',
    '不要删除原有主体，不要忽略小物体。',
    '增强画面质感、色彩、光影和细节。',
    semanticPrompt ? `画面语义说明：${semanticPrompt}` : '',
    sceneDescription ? `场景描述：${sceneDescription}` : '',
    formattedActionSummary ? `结构化动作摘要：${formattedActionSummary}` : '',
    style ? `目标风格：${style}` : '',
    mood ? `画面氛围：${mood}` : '',
    prompt ? `用户补充要求：${prompt}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getSeedreamConfig() {
  const apiUrl = process.env.SEEDREAM_API_URL || DEFAULT_API_URL;

  return {
    apiKey: process.env.SEEDREAM_API_KEY,
    apiUrl: apiUrl.trim().replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, ''),
    model: process.env.SEEDREAM_MODEL || DEFAULT_MODEL,
    size: process.env.SEEDREAM_IMAGE_SIZE || DEFAULT_SIZE,
  };
}

async function fetchImageAsDataUrl(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch Seedream image URL: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  if (!imageBuffer.length) {
    throw new Error('Seedream image URL returned empty data');
  }

  return `data:${contentType};base64,${imageBuffer.toString('base64')}`;
}

async function parseSeedreamResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Seedream API request failed: ${response.status} ${rawText}`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('Seedream API response was not JSON');
  }

  const payload = JSON.parse(rawText);
  const image = payload.data?.[0];

  if (image?.b64_json) {
    return `data:image/png;base64,${image.b64_json}`;
  }

  if (image?.url) {
    return fetchImageAsDataUrl(image.url);
  }

  throw new Error('Seedream API response did not include image data');
}

async function generateWithSeedream(params) {
  const { apiKey, apiUrl, model, size } = getSeedreamConfig();
  const parsedImage = parseDataUrl(params.imageDataUrl);
  const inputImageDataUrl = `data:${parsedImage.mimeType};base64,${parsedImage.base64}`;

  if (!parsedImage.buffer.length) {
    throw new Error('Invalid imageDataUrl');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: buildSeedreamPrompt(params),
      size,
      response_format: 'url',
      image: inputImageDataUrl,
      watermark: false,
    }),
  });

  return {
    imageDataUrl: await parseSeedreamResponse(response),
    isMock: false,
    provider: 'seedream',
  };
}

module.exports = {
  generateWithSeedream,
  parseDataUrl,
  buildSeedreamPrompt,
};
