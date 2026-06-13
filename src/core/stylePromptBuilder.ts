/**
 * Style Prompt Builder
 * 风格化提示词生成器
 * 
 * 将用户选择的风格和氛围转化为适合 AI 图像生成的 prompt
 * 强调保留原始构图，不增加无关主体
 */

export interface StylePromptOptions {
  style: string;
  mood: string;
  sceneDescription?: string;
}

// 风格配置
const styleConfigs: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  '动漫化': {
    title: '动漫风格',
    description: '日式动漫插画风格',
    keywords: ['anime', 'illustration', 'vibrant colors', 'clean lines']
  },
  '电影化': {
    title: '电影风格',
    description: '电影级视觉效果',
    keywords: ['cinematic', 'film grain', 'cinematic lighting', 'dramatic']
  },
  '赛博朋克': {
    title: '赛博朋克风格',
    description: '未来科技城市',
    keywords: ['cyberpunk', 'neon lights', 'futuristic city', 'holographic']
  },
  '水彩画': {
    title: '水彩画风格',
    description: '柔和水彩艺术',
    keywords: ['watercolor', 'soft edges', 'pastel colors', 'artistic']
  },
  '油画': {
    title: '油画风格',
    description: '古典油画质感',
    keywords: ['oil painting', 'classical', 'rich textures', 'warm tones']
  },
  '像素风': {
    title: '像素风格',
    description: '复古像素游戏风',
    keywords: ['pixel art', '8-bit', 'retro game', 'isometric']
  },
  '国风插画': {
    title: '国风插画',
    description: '中国传统艺术',
    keywords: ['chinese illustration', 'traditional', 'ink wash', 'elegant']
  },
  '儿童绘本': {
    title: '儿童绘本风格',
    description: '温馨童趣插画',
    keywords: ['children book illustration', 'cute', 'bright colors', 'whimsical']
  }
};

// 氛围配置
const moodConfigs: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  '清新校园': {
    title: '清新校园',
    description: '校园青春氛围',
    keywords: ['bright', 'sunny campus', 'youthful', 'fresh air']
  },
  '热血冒险': {
    title: '热血冒险',
    description: '动感冒险氛围',
    keywords: ['action', 'adventure', 'dynamic', 'energetic']
  },
  '治愈系': {
    title: '治愈系',
    description: '温暖治愈氛围',
    keywords: ['healing', 'cozy', 'warm', 'peaceful']
  },
  '未来都市': {
    title: '未来都市',
    description: '未来城市氛围',
    keywords: ['futuristic city', 'advanced technology', 'sleek', 'modern']
  },
  '奇幻森林': {
    title: '奇幻森林',
    description: '神秘森林氛围',
    keywords: ['magical forest', 'fantasy', 'mystical', 'enchanted']
  },
  '赛博朋克夜景': {
    title: '赛博朋克夜景',
    description: '霓虹夜色',
    keywords: ['neon night', 'dark city', 'rainy streets', 'glowing']
  },
  '温暖日落': {
    title: '温暖日落',
    description: '夕阳余晖',
    keywords: ['sunset', 'golden hour', 'warm glow', 'peaceful evening']
  },
  '黑色电影': {
    title: '黑色电影',
    description: '黑色电影氛围',
    keywords: ['film noir', 'high contrast', 'moody', 'dramatic shadows']
  },
  '科幻未来': {
    title: '科幻未来',
    description: '科幻太空氛围',
    keywords: ['sci-fi', 'space', 'technology', 'otherworldly']
  },
  '梦幻': {
    title: '梦幻',
    description: '梦幻飘渺氛围',
    keywords: ['dreamy', 'ethereal', 'soft focus', 'magical']
  },
  '神秘': {
    title: '神秘',
    description: '神秘悬疑氛围',
    keywords: ['mysterious', 'enigmatic', 'shadowy', 'intriguing']
  },
  '高对比': {
    title: '高对比',
    description: '强对比视觉效果',
    keywords: ['high contrast', 'bold', 'dramatic lighting', 'striking']
  },
  '柔和': {
    title: '柔和',
    description: '柔和温馨氛围',
    keywords: ['soft', 'gentle', 'muted colors', 'calming']
  }
};

/**
 * 生成风格化提示词
 * 
 * @param options 风格和氛围选项
 * @returns 中文 prompt 字符串
 */
export function buildStylePrompt(options: StylePromptOptions): string {
  const { style, mood, sceneDescription } = options;
  
  // 获取风格配置
  const styleConfig = styleConfigs[style] || {
    title: style,
    description: '',
    keywords: []
  };
  
  // 获取氛围配置
  const moodConfig = moodConfigs[mood] || {
    title: mood,
    description: '',
    keywords: []
  };
  
  // 构建提示词
  let prompt = `请将这张语音绘制的结构化草图转化为高质量${styleConfig.title}插画。`;
  prompt += `\n\n请保留原始画面中的主要元素、空间关系和构图，不要增加与原图无关的主体。`;
  
  // 添加风格描述
  if (styleConfig.description) {
    prompt += `\n\n风格要求：${styleConfig.description}`;
  }
  
  // 添加氛围描述
  if (moodConfig.description) {
    prompt += `\n\n氛围要求：呈现${moodConfig.description}`;
  }
  
  // 添加场景描述
  if (sceneDescription) {
    prompt += `\n\n场景描述：${sceneDescription}`;
  }
  
  // 添加增强要求
  prompt += `\n\n请增强光影层次、色彩氛围和画面完成度。`;
  
  return prompt;
}

/**
 * 获取可用风格列表
 */
export function getAvailableStyles(): string[] {
  return Object.keys(styleConfigs);
}

/**
 * 获取可用氛围列表
 */
export function getAvailableMoods(): string[] {
  return Object.keys(moodConfigs);
}

/**
 * 获取风格描述
 */
export function getStyleDescription(style: string): string {
  return styleConfigs[style]?.description || '';
}

/**
 * 获取氛围描述
 */
export function getMoodDescription(mood: string): string {
  return moodConfigs[mood]?.description || '';
}