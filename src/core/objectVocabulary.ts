export type ObjectType = 
  | 'draw_person'
  | 'draw_cat'
  | 'draw_dog'
  | 'draw_car'
  | 'draw_flower'
  | 'draw_mountain'
  | 'draw_river'
  | 'draw_boat'
  | 'draw_grass'
  | 'draw_bird'
  | 'draw_tree'
  | 'draw_house';

export interface ObjectMapping {
  keywords: string[];
  type: ObjectType;
  defaultColor?: string;
}

export const objectVocabulary: ObjectMapping[] = [
  {
    keywords: ['男人', '女人', '人物', '小人', '人', '学生', '男孩', '女孩', '小孩'],
    type: 'draw_person',
    defaultColor: '#4A90D9'
  },
  {
    keywords: ['猫', '小猫', '猫咪', '猫猫'],
    type: 'draw_cat',
    defaultColor: '#FFB347'
  },
  {
    keywords: ['狗', '小狗', '狗狗', '犬'],
    type: 'draw_dog',
    defaultColor: '#8B4513'
  },
  {
    keywords: ['汽车', '小车', '车辆', '轿车', '车子'],
    type: 'draw_car',
    defaultColor: '#E74C3C'
  },
  {
    keywords: ['树', '树木', '大树', '小树'],
    type: 'draw_tree',
    defaultColor: '#228B22'
  },
  {
    keywords: ['房子', '房屋', '屋子', '房屋建筑'],
    type: 'draw_house',
    defaultColor: '#FFFF00'
  },
  {
    keywords: ['花', '花朵', '鲜花', '小花'],
    type: 'draw_flower',
    defaultColor: '#FF69B4'
  },
  {
    keywords: ['山', '大山', '山脉', '山丘'],
    type: 'draw_mountain',
    defaultColor: '#8FBC8F'
  },
  {
    keywords: ['河', '河流', '小河', '江水', '溪流'],
    type: 'draw_river',
    defaultColor: '#3498DB'
  },
  {
    keywords: ['船', '小船', '帆船', '船只', '轮船'],
    type: 'draw_boat',
    defaultColor: '#8B4513'
  },
  {
    keywords: ['草地', '草坪', '草', '草丛'],
    type: 'draw_grass',
    defaultColor: '#2ECC71'
  },
  {
    keywords: ['鸟', '小鸟', '飞鸟', '鸟儿', '麻雀'],
    type: 'draw_bird',
    defaultColor: '#34495E'
  }
];

export function matchObjectType(text: string): ObjectMapping | null {
  for (const mapping of objectVocabulary) {
    for (const keyword of mapping.keywords) {
      if (text.includes(keyword)) {
        return mapping;
      }
    }
  }
  return null;
}

export function extractColor(text: string): string | null {
  const colorMap: Record<string, string> = {
    '红色': '#E74C3C',
    '蓝色': '#3498DB',
    '绿色': '#2ECC71',
    '黄色': '#F1C40F',
    '紫色': '#9B59B6',
    '橙色': '#E67E22',
    '粉色': '#FF69B4',
    '黑色': '#34495E',
    '白色': '#FFFFFF',
    '灰色': '#95A5A6',
    '棕色': '#8B4513'
  };
  
  for (const [colorName, hex] of Object.entries(colorMap)) {
    if (text.includes(colorName)) {
      return hex;
    }
  }
  return null;
}
