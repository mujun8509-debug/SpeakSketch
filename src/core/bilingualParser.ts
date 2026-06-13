import { DrawCommand } from './commandTypes';
import { parse } from './localParser';
import { parseEnglishCommand } from './englishCommandParser';
import { detectLanguage } from './languageNormalizer';

export interface ParseResult {
  command: DrawCommand | null;
  language: 'zh' | 'en' | 'mixed' | 'unknown';
}

export function parseBilingualCommand(text: string): ParseResult {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return { command: null, language: 'unknown' };
  }
  
  const language = detectLanguage(trimmedText);
  
  if (language === 'zh') {
    const command = parse(trimmedText);
    return { command, language };
  }
  
  if (language === 'en') {
    const command = parseEnglishCommand(trimmedText);
    return { command, language };
  }
  
  if (language === 'mixed') {
    let command = parseEnglishCommand(trimmedText);
    if (command) {
      return { command, language };
    }
    command = parse(trimmedText);
    return { command, language };
  }
  
  let command = parseEnglishCommand(trimmedText);
  if (command) {
    return { command, language: 'en' };
  }
  
  command = parse(trimmedText);
  return { command, language: language === 'unknown' ? 'unknown' : 'zh' };
}