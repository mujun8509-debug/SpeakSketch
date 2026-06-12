export const colorMap: Record<string, string> = {
  '红色': '#FF0000',
  '红': '#FF0000',
  '蓝色': '#0000FF',
  '蓝': '#0000FF',
  '绿色': '#00FF00',
  '绿': '#00FF00',
  '黄色': '#FFFF00',
  '黄': '#FFFF00',
  '黑色': '#000000',
  '黑': '#000000',
  '白色': '#FFFFFF',
  '白': '#FFFFFF',
  '紫色': '#800080',
  '紫': '#800080',
  '橙色': '#FFA500',
  '橙': '#FFA500',
  '粉色': '#FFC0CB',
  '粉': '#FFC0CB',
  '灰色': '#808080',
  '灰': '#808080',
  '青色': '#00FFFF',
  '青': '#00FFFF',
};

export function getColor(colorName: string): string {
  return colorMap[colorName] || colorMap['黑色'];
}
