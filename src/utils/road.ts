import * as PIXI from 'pixi.js';

interface CreateRoadParams {
  app: PIXI.Application;
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: number;
}

interface RoadLineParams {
  app: PIXI.Application;
  amount: number;
  stageWidth: number;
  stageHeight: number;
  lineSpace: number;
  roadWidth: number;
  lineColor?: number;
}

type Direction = 'left' | 'right' | 'top' | 'bottom';
interface RoadLightParams {
  app: PIXI.Application;
  roadWidth: number;
  width: number;
  height: number;
  lightAlpha: number;
  position: Direction;
  dispatch: any;
}

/**
 * 创建道路
 * @param param0
 */
export const createRoad = ({
  app,
  x,
  y,
  w,
  h,
  fillColor = 0xffffff,
}: CreateRoadParams) => {
  const borderline = new PIXI.Graphics();
  borderline.lineStyle(0, 0xaaaaaa, 1); //边线(宽度，颜色，透明度)
  borderline.beginFill(fillColor); //填充
  borderline.drawRect(x, y, w, h); //x,y,w,h
  borderline.endFill();
  app.stage.addChild(borderline); //添加到舞台中
};

/**
 * 创建道路线
 * @param param0
 */
export const roadLine = ({
  app,
  stageWidth,
  stageHeight,
  amount,
  lineSpace,
  roadWidth,
  lineColor = 0x000000,
}: RoadLineParams) => {
  let roadWidthLine = (stageWidth - roadWidth) / 2 / (amount / 2);
  let startRow = 0;
  let startColumn = 0;
  for (let i = 0; i < amount; i++) {
    // 横着道路线
    const borderlineRow = new PIXI.Graphics();
    borderlineRow.lineStyle(2, 0xaaaaaa, 1); //边线(宽度，颜色，透明度)
    borderlineRow.beginFill(lineColor); //填充

    if (i === 10) {
      startRow = (stageWidth - roadWidth) / 2 + roadWidth;
      startColumn = (stageHeight - roadWidth) / 2 + roadWidth;
    }

    borderlineRow.moveTo(startRow, stageHeight / 2);
    startRow += roadWidthLine;
    borderlineRow.lineTo(startRow - lineSpace, stageHeight / 2);
    app.stage.addChild(borderlineRow);

    // 竖着道路线
    const borderlineColumn = new PIXI.Graphics();
    borderlineColumn.lineStyle(2, 0xaaaaaa, 1); //边线(宽度，颜色，透明度)
    borderlineColumn.beginFill(lineColor); //填充

    borderlineColumn.moveTo(stageWidth / 2, startColumn);
    startColumn += roadWidthLine;
    borderlineColumn.lineTo(stageWidth / 2, startColumn - lineSpace);
    app.stage.addChild(borderlineColumn);
  }
};

export const roadLight = ({
  app,
  roadWidth,
  width,
  height,
  dispatch,
  position = 'right',
  lightAlpha,
}: RoadLightParams) => {
  let lightLength = 10;
  let lightSpace = (roadWidth - lightLength * 3) / 3;
  let lights = new PIXI.Container();
  const lightColorArr = [0x13ee13, 0xfc0c0c, 0xd8e413];

  let startX = (width + roadWidth) / 2 - lightLength;
  let startY = (height - roadWidth) / 2 + lightLength / 2;

  if (position === 'left') {
    startX = (width - roadWidth) / 2 + lightLength;
  } else if (position === 'top' || position === 'bottom') {
    startX = (width - roadWidth) / 2 + lightLength / 2;
    if (position === 'bottom') {
      startY = (height + roadWidth) / 2 - lightLength / 2;
    }
  }

  lightColorArr.forEach((color, index) => {
    const light = new PIXI.Graphics();
    light.beginFill(color);
    light.drawEllipse(
      position !== 'top' && position !== 'bottom'
        ? startX
        : startX + lightSpace * (index + 1),
      position !== 'top' && position !== 'bottom'
        ? startY + lightSpace * (index + 1)
        : startY,
      position !== 'top' && position !== 'bottom'
        ? lightLength / 2
        : lightLength,
      position !== 'top' && position !== 'bottom'
        ? lightLength
        : lightLength / 2
    ); //x,y,w、h
    light.endFill();
    light.alpha = lightAlpha;
    lights.addChild(light);
  });

  dispatch({ type: 'addLight', payload: lights });
  app.stage.addChild(lights);
};

/**
 * 创建交通灯
 * @param param0
 */
export const createLights = ({
  app,
  roadWidth,
  width,
  height,
  dispatch,
  lightAlpha,
}: Omit<RoadLightParams, 'position'>) => {
  let arr: Direction[] = ['left', 'right', 'top', 'bottom'];
  arr.forEach((direction) => {
    roadLight({
      app,
      roadWidth,
      width,
      height,
      position: direction,
      dispatch,
      lightAlpha,
    });
  });
};
