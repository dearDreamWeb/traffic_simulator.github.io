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
