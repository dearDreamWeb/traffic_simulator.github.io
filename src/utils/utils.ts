/**
 * 获取范围内的随机数
 */
export const randomRange = (min: number, max: number) => {
  return min + Math.floor((max - min) * Math.random());
};
