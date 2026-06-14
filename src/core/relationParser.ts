import { DrawAction } from './commandTypes';
import { objectVocabulary, ObjectMapping } from './objectVocabulary';

export type RelationType = 
  | 'beside'      // 旁边
  | 'left'        // 左边
  | 'right'       // 右边
  | 'above'       // 上方
  | 'below'       // 下方
  | 'sky'         // 天空中
  | 'ground'      // 地面上
  | 'river_top'   // 河上
  | 'east'        // 东方
  | 'west'        // 西方
  | 'south'       // 南方
  | 'north'       // 北方
  | 'northeast'   // 东北
  | 'southeast'   // 东南
  | 'northwest'   // 西北
  | 'southwest'   // 西南
  | 'far'         // 远处
  | 'near';       // 近处

export interface RelationResult {
  actions: DrawAction[];
  relationType: RelationType;
  subjectType: string;
  referenceType: string;
}

interface ObjectInfo {
  mapping: ObjectMapping;
  keyword: string;
  position: number;
}

// 空间布局常量
const LAYOUT_OFFSET: Record<string, number> = {
  beside: 150,
  left: 180,
  right: 180,
  above: 150,
  below: 150,
  sky_y: 100,      // y 在 100 到 180 之间
  ground_y: 420,   // y 在 420 到 500 之间
  river_y: 350,
  far_offset: 300,
  near_offset: 80,
  // 方位区域
  north_x: 400,
  north_y: 150,
  south_x: 400,
  south_y: 500,
  east_x: 700,
  east_y: 320,
  west_x: 100,
  west_y: 320,
};

// 空间关系关键词
const RELATION_KEYWORDS: Record<RelationType, string[]> = {
  beside: ['旁边', '附近', '旁边的'],
  left: ['左边', '左侧', '左方', '左面'],
  right: ['右边', '右侧', '右方', '右面'],
  above: ['上方', '上面', '之上', '头顶', '顶上'],
  below: ['下方', '下面', '之下', '底下'],
  sky: ['天空', '天上', '天上飞', '空中', '飞在天上'],
  ground: ['地面', '地上', '地上跑', '地上站着', '站在地上'],
  river_top: ['河上', '水上', '湖面', '水面上', '河里'],
  east: ['东边', '东方', '东面'],
  west: ['西边', '西方', '西面'],
  south: ['南边', '南方', '南面'],
  north: ['北边', '北方', '北面'],
  northeast: ['东北', '东北方', '东北面'],
  southeast: ['东南', '东南方', '东南面'],
  northwest: ['西北', '西北方', '西北面'],
  southwest: ['西南', '西南方', '西南面'],
  far: ['远处', '远方', '远处的'],
  near: ['近处', '附近', '近处的', '靠近'],
};

// 动作关键词 - 用于识别"画一个X"模式
const ACTION_KEYWORDS = ['画一个', '画一只', '画一辆', '画一朵', '画一座', '画一条', '画一艘', '画一片', '画几只'];

// 识别对象
function findObject(text: string, startPos: number = 0): ObjectInfo | null {
  let bestMatch: ObjectInfo | null = null;
  
  for (const mapping of objectVocabulary) {
    for (const keyword of mapping.keywords) {
      const pos = text.indexOf(keyword, startPos);
      if (pos !== -1) {
        if (!bestMatch || pos < bestMatch.position) {
          bestMatch = { mapping, keyword, position: pos };
        }
      }
    }
  }
  
  return bestMatch;
}

// 识别空间关系
function findRelation(text: string): RelationType | null {
  for (const [relation, keywords] of Object.entries(RELATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return relation as RelationType;
      }
    }
  }
  return null;
}

// 计算对象位置
function calculatePosition(
  relation: RelationType,
  refX: number,
  refY: number,
  isSubject: boolean
): { x: number; y: number } {
  const offset = LAYOUT_OFFSET[relation] || 150;
  
  switch (relation) {
    case 'beside':
      return isSubject 
        ? { x: refX - offset, y: refY }
        : { x: refX + offset, y: refY };
    case 'left':
      return { x: refX - offset, y: refY };
    case 'right':
      return { x: refX + offset, y: refY };
    case 'above':
      return { x: refX, y: refY - offset };
    case 'below':
      return { x: refX, y: refY + offset };
    case 'sky':
      return { x: 360, y: LAYOUT_OFFSET.sky_y + 30 };
    case 'ground':
      return { x: 400, y: LAYOUT_OFFSET.ground_y + 30 };
    case 'river_top':
      return isSubject
        ? { x: refX, y: refY - 55 }
        : { x: refX, y: LAYOUT_OFFSET.river_y + 60 };
    // 方位系统
    case 'north':
      return { x: LAYOUT_OFFSET.north_x, y: LAYOUT_OFFSET.north_y };
    case 'south':
      return { x: LAYOUT_OFFSET.south_x, y: LAYOUT_OFFSET.south_y };
    case 'east':
      return { x: LAYOUT_OFFSET.east_x, y: LAYOUT_OFFSET.east_y };
    case 'west':
      return { x: LAYOUT_OFFSET.west_x, y: LAYOUT_OFFSET.west_y };
    case 'northeast':
      return { x: 560, y: 170 };
    case 'southeast':
      return { x: 560, y: 470 };
    case 'northwest':
      return { x: 240, y: 170 };
    case 'southwest':
      return { x: 240, y: 470 };
    // 远近关系
    case 'far':
      // 远离中心
      const farAngle = Math.random() * Math.PI * 2;
      return { 
        x: refX + Math.cos(farAngle) * LAYOUT_OFFSET.far_offset, 
        y: refY + Math.sin(farAngle) * LAYOUT_OFFSET.far_offset 
      };
    case 'near':
      // 靠近参照点
      const nearAngle = Math.random() * Math.PI * 2;
      return { 
        x: refX + Math.cos(nearAngle) * LAYOUT_OFFSET.near_offset, 
        y: refY + Math.sin(nearAngle) * LAYOUT_OFFSET.near_offset 
      };
    default:
      return { x: refX, y: refY };
  }
}

// 解析空间关系指令
export function parseRelation(text: string): RelationResult | null {
  // 检查是否包含空间关系关键词
  const relation = findRelation(text);
  if (!relation) {
    return null;
  }
  
  // 检查是否包含"画"关键词
  const hasDrawKeyword = ACTION_KEYWORDS.some(kw => text.includes(kw));
  if (!hasDrawKeyword) {
    return null;
  }
  
  // 提取关系后的对象（主体）
  let subjectObj: ObjectInfo | null = null;
  let referenceObj: ObjectInfo | null = null;
  
  // 模式匹配 - 支持更多空间关系
  const patterns = [
    // 基本空间关系
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:站在?|在)(.{1,10})(?:旁边|附近|左边|右侧|右面|上方|顶上|下方|底下)/,
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:停|飞|站)在(.{1,10})(?:旁边|天空|空中|地面|地上|河上|水上|湖面)/,
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:在|飞到|跑到)(.{1,10})(?:旁边|天空|地面|河上|水上)/,
    // 方位词模式
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:在|飞向)(东边|东方|西面|西边|南方|北边|东北|东南|西北|西南)/,
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:的)(东边|东方|西面|西边|南方|北边|东北|东南|西北|西南)(?:有|是)/,
    // 远近关系模式
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:在)(.{1,10})(?:远处|远方|近处|附近)/,
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:在)(远处|远方|近处)/,
    // 简化模式
    /(?:画(?:一(?:个|只|辆|朵|座|条|艘|片)|几只))(.{1,10})(?:的)(旁边|附近|左边|右边)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const subjectName = match[1].trim();
      const referenceName = match[2].trim();
      
      // 查找主体对象
      for (const mapping of objectVocabulary) {
        if (mapping.keywords.some(kw => subjectName.includes(kw))) {
          subjectObj = { mapping, keyword: subjectName, position: 0 };
          break;
        }
      }
      
      // 查找参照对象
      for (const mapping of objectVocabulary) {
        if (mapping.keywords.some(kw => referenceName.includes(kw))) {
          referenceObj = { mapping, keyword: referenceName, position: 0 };
          break;
        }
      }
      
      // 如果没找到，尝试直接匹配关键词
      if (!subjectObj) {
        const found = findObject(subjectName);
        if (found) subjectObj = found;
      }
      if (!referenceObj) {
        const found = findObject(referenceName);
        if (found) referenceObj = found;
      }
      
      if (subjectObj && referenceObj) {
        break;
      }
    }
  }
  
  // 如果模式匹配失败，尝试简化匹配
  if (!subjectObj || !referenceObj) {
    // 找到所有对象
    const allObjects: ObjectInfo[] = [];
    let pos = 0;
    while (pos < text.length) {
      const obj = findObject(text, pos);
      if (!obj) break;
      allObjects.push(obj);
      pos = obj.position + obj.keyword.length;
    }
    
    if (allObjects.length >= 2) {
      // 第一个是主体，最后一个是参照
      subjectObj = allObjects[0];
      referenceObj = allObjects[allObjects.length - 1];
    } else if (allObjects.length === 1) {
      // 只有一个对象，参照物是主体自己
      subjectObj = allObjects[0];
      referenceObj = allObjects[0];
    }
  }
  
  if (!subjectObj) {
    return null;
  }
  
  // 确定参照位置
  let refX = 480;
  let refY = 340;
  
  // 如果有参照对象，先画参照对象并获取其位置
  if (referenceObj && referenceObj !== subjectObj) {
    const refPos = calculatePosition(relation, refX, refY, false);
    refX = refPos.x;
    refY = refPos.y;
  }
  
  // 计算主体位置
  const subjectPos = calculatePosition(relation, refX, refY, true);
  
  // 生成 actions
  const actions: DrawAction[] = [];
  
  // 先画参照物（如果有）
  if (referenceObj && referenceObj !== subjectObj) {
    const refAction: DrawAction = {
      type: referenceObj.mapping.type as DrawAction['type'],
      payload: {
        x: refX,
        y: refY,
      }
    };
    actions.push(refAction);
  }
  
  // 画主体
  const subjectAction: DrawAction = {
    type: subjectObj.mapping.type as DrawAction['type'],
    payload: {
      x: subjectPos.x,
      y: subjectPos.y,
      count: text.includes('几只') && subjectObj.mapping.type === 'draw_bird' ? 3 : undefined,
    }
  };
  actions.push(subjectAction);
  
  return {
    actions,
    relationType: relation,
    subjectType: subjectObj.mapping.type,
    referenceType: referenceObj ? referenceObj.mapping.type : subjectObj.mapping.type,
  };
}

// 检查文本是否包含空间关系
export function hasRelation(text: string): boolean {
  return findRelation(text) !== null;
}
