export interface WordMap {
  [key: string]: string;
}

export const colorMap: WordMap = {
  red: '红色',
  blue: '蓝色',
  green: '绿色',
  yellow: '黄色',
  black: '黑色',
  white: '白色',
  purple: '紫色',
  orange: '橙色',
  pink: '粉色',
  cyan: '青色',
  gray: '灰色',
  grey: '灰色',
  brown: '棕色',
  gold: '金色',
  silver: '银色',
};

export const objectMap: WordMap = {
  circle: '圆形',
  rectangle: '矩形',
  square: '矩形',
  triangle: '三角形',
  line: '直线',
  text: '文字',
  person: '人物',
  man: '人物',
  woman: '人物',
  student: '人物',
  cat: '猫',
  dog: '狗',
  car: '汽车',
  tree: '树',
  flower: '花',
  mountain: '山',
  river: '河',
  boat: '船',
  bird: '鸟',
  birds: '鸟',
  grass: '草地',
  sun: '太阳',
  cloud: '云',
  clouds: '云',
  park: '公园',
  beach: '海边',
  campus: '校园',
  school: '校园',
  house: '房子',
  home: '房子',
};

export const positionMap: WordMap = {
  left: '左边',
  right: '右边',
  'top left': '左上角',
  'top-right': '右上角',
  'bottom left': '左下角',
  'bottom-right': '右下角',
  center: '中间',
  middle: '中间',
  sky: '天空',
  ground: '地面',
  'next to': '旁边',
  beside: '旁边',
  near: '旁边',
  above: '上方',
  below: '下方',
  over: '上方',
  under: '下方',
};

export const actionMap: WordMap = {
  draw: '画',
  create: '画',
  add: '画',
  make: '画',
  move: '移动',
  delete: '删除',
  remove: '删除',
  'change color': '改色',
  'change the color': '改色',
  'change to': '改色',
  resize: '放大',
  'make bigger': '放大',
  enlarge: '放大',
  undo: '撤销',
  redo: '重做',
  clear: '清空',
  export: '导出',
  replay: '重放',
};

export function normalizeEnglishToChinese(text: string): string {
  let result = text.toLowerCase().trim();
  
  result = result.replace(/"([^"]+)"/g, '「$1」');
  
  const combinedMap: WordMap = {
    ...colorMap,
    ...objectMap,
    ...positionMap,
    ...actionMap,
  };
  
  for (const [english, chinese] of Object.entries(combinedMap)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, chinese);
  }
  
  return result;
}

export function detectLanguage(text: string): 'zh' | 'en' | 'mixed' | 'unknown' {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
  
  const hasChinese = chineseChars > 0;
  const hasEnglish = englishWords > 0;
  
  if (hasChinese && hasEnglish) return 'mixed';
  if (hasChinese) return 'zh';
  if (hasEnglish) return 'en';
  return 'unknown';
}