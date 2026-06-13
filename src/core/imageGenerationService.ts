/**
 * Image Generation Service
 * 图像生成服务
 * 
 * 重要说明：
 * - 前端不保存 OpenAI API Key
 * - 前端只通过 VITE_IMAGE_API_URL 调用后端接口
 * - 未配置时使用 Mock 模式
 */

export interface ImageGenerationParams {
  imageDataUrl: string;
  style: string;
  mood: string;
  prompt: string;
}

export interface ImageGenerationResult {
  imageUrl?: string;
  imageDataUrl?: string;
  isMock: boolean;
  error?: string;
}

export interface ImageGenerationConfig {
  apiUrl?: string;
  isConfigured: boolean;
}

/**
 * 获取图像生成配置
 */
export function getImageGenerationConfig(): ImageGenerationConfig {
  const apiUrl = import.meta.env.VITE_IMAGE_API_URL as string | undefined;
  return {
    apiUrl,
    isConfigured: !!apiUrl,
  };
}

/**
 * 生成风格化图像
 * 
 * 后端接口约定：
 * POST VITE_IMAGE_API_URL
 * 
 * 请求体：
 * {
 *   "imageDataUrl": "data:image/png;base64,...",
 *   "style": "动漫化",
 *   "mood": "清新校园",
 *   "prompt": "..."
 * }
 * 
 * 返回：
 * {
 *   "imageUrl": "https://..."
 * }
 * 或：
 * {
 *   "imageDataUrl": "data:image/png;base64,..."
 * }
 */
export async function generateStyledImage(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const { imageDataUrl, style, mood, prompt } = params;
  const config = getImageGenerationConfig();
  
  // Mock 模式：未配置 API URL
  if (!config.isConfigured || !config.apiUrl) {
    // 在 Mock 模式下，直接返回原始图像
    return {
      imageDataUrl,
      isMock: true,
    };
  }
  
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl,
        style,
        mood,
        prompt,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        isMock: false,
        error: `图像生成服务错误: ${response.status} ${errorText}`,
      };
    }
    
    const data = await response.json();
    
    // 兼容 imageUrl 和 imageDataUrl 两种返回
    if (data.imageUrl) {
      return {
        imageUrl: data.imageUrl,
        isMock: false,
      };
    } else if (data.imageDataUrl) {
      return {
        imageDataUrl: data.imageDataUrl,
        isMock: false,
      };
    } else {
      return {
        isMock: false,
        error: '后端返回格式错误，缺少 imageUrl 或 imageDataUrl',
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '网络请求失败';
    return {
      isMock: false,
      error: `图像生成请求失败: ${errorMsg}`,
    };
  }
}

/**
 * 下载图像
 */
export function downloadImage(imageUrl: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename || `speaksketch-styled-${Date.now()}.png`;
  link.click();
}

/**
 * 将 Data URL 转换为可下载的 Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * 下载 Data URL 图像
 */
export function downloadDataUrl(dataUrl: string, filename?: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `speaksketch-styled-${Date.now()}.png`;
  link.click();
  
  // 清理
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}