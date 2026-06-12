import { DrawCommand } from './commandTypes';
import { generateId } from '../utils/id';

export async function parseWithLLM(text: string): Promise<DrawCommand> {
  console.warn('LLM parser not implemented. Using fallback to local parser.');
  
  return {
    id: generateId(),
    rawText: text,
    actions: [],
    timestamp: Date.now(),
  };
}

export async function setAPIKey(_apiKey: string): Promise<void> {
  console.warn('LLM API key not implemented.');
}

export interface LLMConfig {
  apiKey: string;
  model: string;
}

export function configureLLM(_config: LLMConfig): void {
  console.warn('LLM configuration not implemented.');
}
