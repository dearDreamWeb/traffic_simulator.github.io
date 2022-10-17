import { useState, useEffect, useRef, useReducer } from 'react';
import styles from './App.module.less';
import * as PIXI from 'pixi.js';
import utils from './utils';
import { reducer, ContextData, initData, InitData } from './reducer/useReducer'; //引入useReducer文件
import catYellowLeft from './assets/images/cart_yellow_left.png';
import catYellowRight from './assets/images/cart_yellow_right.png';
import catYellowTop from './assets/images/cart_yellow_top.png';
import catYellowBottom from './assets/images/cart_yellow_bottom.png';

const { createRoad, roadLine, createLights } = utils;

interface TextureCacheObj {
  left: PIXI.Texture<PIXI.Resource>;
  right: PIXI.Texture<PIXI.Resource>;
  top: PIXI.Texture<PIXI.Resource>;
  bottom: PIXI.Texture<PIXI.Resource>;
}

interface Sprite extends PIXI.Sprite {
  state?: 'accelerate' | 'slowDown' | 'normal'; // 加速，减速，正常
  speed: number;
  id: number;
}

const WIDTH = 800;
const HEIGHT = 800;
const ROADWIDTH = 100;
const LIGHTALPHA = 0.06;
const REDLIGHTTIMER = 5; // 红灯秒数
const CARLENGTH = 50; // 车长

class ListNode {
  val: Sprite;
  next: ListNode | null;
  constructor(val: Sprite) {
    this.val = val;
    this.next = null;
  }
}

interface CarData {
  left: ListNode | null;
  right: ListNode | null;
  top: ListNode | null;
  bottom: ListNode | null;
}

type Direction = 'left' | 'right' | 'top' | 'bottom';

function App() {
  let [app, setApp] = useState<PIXI.Application>();
  const [state, dispatch] = useReducer(reducer, initData);
  let isRowGreen = useRef(true);
  let timerCount = useRef(0).current;
  let [texture, setTexture] = useState<TextureCacheObj>();
  let carData = useRef<CarData>({
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  useEffect(() => {
    let _app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      antialias: true,
      transparent: false,
      resolution: 1,
      view: document.getElementById('mainCanvas') as HTMLCanvasElement,
    });
    setApp(_app);
  }, []);

  useEffect(() => {
    if (!app) {
      return;
    }
    loaderResources();
    init();
  }, [app]);

  // 交通灯变化
  useEffect(() => {
    if (!app) {
      return;
    }
    const { lightsData } = state;
    if (lightsData.length === 4) {
      // TODO 换成 requestAnimationFrame
      lightAnimation(lightsData);
    }
  }, [app, state.lightsData]);

  /**
   * 红绿灯动画
   */
  const lightAnimation = (lightsData: any) => {
    let startTime = performance.now();
    function animation() {
      let endTime = performance.now();
      // 一秒
      if (endTime - startTime >= 1000) {
        startTime = endTime;
        timerCount++;
        if (timerCount > REDLIGHTTIMER) {
          isRowGreen.current = !isRowGreen.current;
          timerCount = 0;
        }
        let isDiff3 = REDLIGHTTIMER - timerCount;
        if (isRowGreen.current) {
          for (let i = 2; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
              lightsData[i].children[j].alpha = j === 1 ? 1 : LIGHTALPHA;
            }
          }

          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
              if (isDiff3 > 3) {
                lightsData[i].children[j].alpha = j === 0 ? 1 : LIGHTALPHA;
              } else {
                lightsData[i].children[j].alpha = j === 2 ? 1 : LIGHTALPHA;
              }
            }
          }
        } else {
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
              lightsData[i].children[j].alpha = j === 1 ? 1 : LIGHTALPHA;
            }
          }
          for (let i = 2; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
              if (isDiff3 > 3) {
                lightsData[i].children[j].alpha = j === 0 ? 1 : LIGHTALPHA;
              } else {
                lightsData[i].children[j].alpha = j === 2 ? 1 : LIGHTALPHA;
              }
            }
          }
        }
      }

      requestAnimationFrame(animation);
    }
    animation();
  };

  useEffect(() => {
    if (!app || !texture) {
      return;
    }
    addCar('left');
    addCar('left');

    addCar('right');
    addCar('right');
    addCar('right');

    addCar('top');
    addCar('top');
    addCar('top');

    addCar('bottom');
    addCar('bottom');
    addCar('bottom');

    interface RoadLightObj {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
    let roadLightObj: RoadLightObj = {
      left: (WIDTH + ROADWIDTH + CARLENGTH) / 2,
      right: (WIDTH - ROADWIDTH - CARLENGTH) / 2,
      top: (HEIGHT + ROADWIDTH + CARLENGTH) / 2,
      bottom: (HEIGHT - ROADWIDTH - CARLENGTH) / 2,
    };
    app.ticker.add(() => {
      for (let key in carData.current) {
        let copyList = carData.current[key as keyof CarData];
        let roadLightX = roadLightObj[key as keyof RoadLightObj];
        let coordinate: 'x' | 'y' =
          key === 'left' || key === 'right' ? 'x' : 'y';
        // 上一节点
        let lastNode = null;
        while (copyList) {
          const sprite = copyList.val;

          // 是否停车
          let isStop = false;
          // 判断是否在红绿灯 5 距离大小，在判断是否为红灯
          if (key === 'left' || key === 'top') {
            if (
              sprite[coordinate] - roadLightX <= 5 &&
              sprite[coordinate] - roadLightX >= 0
            ) {
              isStop = giveWay(key as Direction);
              if (key === 'left' && !isRowGreen.current) {
                isStop = true;
              }
              if (key === 'top' && isRowGreen.current) {
                isStop = true;
              }
            }
          } else if (key === 'right' || key === 'bottom') {
            if (
              roadLightX - sprite[coordinate] <= 5 &&
              roadLightX - sprite[coordinate] >= 0
            ) {
              isStop = giveWay(key as Direction);
              if (key === 'right' && !isRowGreen.current) {
                isStop = true;
              }
              if (key === 'bottom' && isRowGreen.current) {
                isStop = true;
              }
            }
          }

          isOverScreen(key as Direction, sprite);

          // 判断距离上一辆车的距离是否小于3，小于3就等于3
          if (
            lastNode &&
            Math.abs(sprite[coordinate] - lastNode[coordinate]) <= CARLENGTH + 4
          ) {
            sprite[coordinate] =
              key === 'left' || key === 'top'
                ? lastNode[coordinate] + CARLENGTH + 4
                : key === 'right' || key === 'bottom'
                ? lastNode[coordinate] - CARLENGTH - 4
                : sprite[coordinate];
            if (sprite.state !== 'slowDown') {
              sprite.speed = lastNode.speed - Math.random() * lastNode.speed;
              sprite.state = 'slowDown';
            }
            isStop = true;
          } else if (
            lastNode &&
            Math.abs(sprite[coordinate] - lastNode[coordinate]) > CARLENGTH + 30
          ) {
            if (sprite.state !== 'accelerate') {
              sprite.speed = sprite.speed + Math.random() * (4 - sprite.speed);
              sprite.state = 'accelerate';
            }
          }

          if (!isStop) {
            if (key === 'left' || key === 'top') {
              sprite[coordinate] -= sprite.speed;
            } else {
              sprite[coordinate] += sprite.speed;
            }
          }

          lastNode = sprite;
          copyList = copyList.next;
        }
      }
    });
  }, [app, texture]);

  const init = () => {
    if (!app) {
      return;
    }
    // 横着的道路
    createRoad({
      app,
      x: 0,
      y: (HEIGHT - ROADWIDTH) / 2,
      w: WIDTH,
      h: ROADWIDTH,
    });
    // 竖着的道路
    createRoad({
      app,
      x: (WIDTH - ROADWIDTH) / 2,
      y: 0,
      w: ROADWIDTH,
      h: HEIGHT,
    });

    roadLine({
      app,
      stageWidth: WIDTH,
      stageHeight: HEIGHT,
      amount: 20,
      lineSpace: 5,
      roadWidth: ROADWIDTH,
    });

    createLights({
      app,
      roadWidth: ROADWIDTH,
      width: WIDTH,
      height: HEIGHT,
      lightAlpha: LIGHTALPHA,
      dispatch,
    });
  };

  const loaderResources = () => {
    const loaders = new PIXI.Loader();
    loaders
      .add('catYellowLeft', catYellowLeft)
      .add('catYellowRight', catYellowRight)
      .add('catYellowTop', catYellowTop)
      .add('catYellowBottom', catYellowBottom);
    loaders.load();
    loaders.onComplete.add(() => {
      setTexture({
        left: loaders.resources.catYellowLeft.texture!,
        right: loaders.resources.catYellowRight.texture!,
        top: loaders.resources.catYellowTop.texture!,
        bottom: loaders.resources.catYellowBottom.texture!,
      });
    });
  };

  /**
   * 添加车辆
   * @param direction : ;
   * @returns
   */
  const addCar = (direction: Direction) => {
    if (!app) {
      return;
    }
    let sprite = new PIXI.Sprite(texture![direction]) as Sprite;
    sprite.id = Math.floor(Math.random() * 999999);
    sprite.speed = !carData.current[direction]
      ? Math.random() * 1 + 3
      : 1 + Math.random() * 3;
    sprite.anchor.set(0.5);
    sprite.state = 'normal';
    // 计算车的宽高
    if (direction === 'left' || direction === 'right') {
      sprite.width = CARLENGTH;
      sprite.height = CARLENGTH / 1.5;
    } else {
      sprite.width = CARLENGTH / 1.5;
      sprite.height = CARLENGTH;
    }

    // 链表最后添加节点
    if (carData.current[direction]) {
      let current = carData.current[direction]!;
      while (current.next) {
        current = current.next!;
      }
      switch (direction) {
        case 'left':
          sprite.y = (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4;
          if (current.val.x >= WIDTH - CARLENGTH / 2) {
            sprite.x = current.val.x + CARLENGTH * 1.5;
          } else {
            sprite.x = WIDTH - CARLENGTH / 2;
          }
          break;
        case 'right':
          sprite.y = HEIGHT / 2 + ROADWIDTH / 4;
          if (current.val.x <= -CARLENGTH / 2) {
            sprite.x = current.val.x - CARLENGTH * 1.5;
          } else {
            sprite.x = -CARLENGTH / 2;
          }
          break;
        case 'top':
          sprite.x = WIDTH / 2 + ROADWIDTH / 4;
          if (current.val.y >= HEIGHT + CARLENGTH / 2) {
            sprite.y = current.val.y + CARLENGTH * 1.5;
          } else {
            sprite.y = HEIGHT + CARLENGTH / 2;
          }
          break;
        case 'bottom':
          sprite.x = WIDTH / 2 - ROADWIDTH / 4;
          if (current.val.y <= -CARLENGTH / 2) {
            sprite.y = current.val.y - CARLENGTH * 1.5;
          } else {
            sprite.y = -CARLENGTH / 2;
          }
          break;
      }
      current.next = new ListNode(sprite);
    } else {
      if (direction === 'left') {
        sprite.y = (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4;
        sprite.x = WIDTH - CARLENGTH / 2;
      } else if (direction === 'right') {
        sprite.y = HEIGHT / 2 + ROADWIDTH / 4;
        sprite.x = -CARLENGTH / 2;
      } else if (direction === 'top') {
        sprite.x = WIDTH / 2 + ROADWIDTH / 4;
        sprite.y = HEIGHT + CARLENGTH / 2;
      } else if (direction === 'bottom') {
        sprite.x = WIDTH / 2 - ROADWIDTH / 4;
        sprite.y = -CARLENGTH / 2;
      }
      carData.current[direction] = new ListNode(sprite);
    }
    app.stage.addChild(sprite);
  };

  /**
   * 判断汽车是否走出画面，链表中删除，并且从舞台中删除，在添加一辆车
   */
  const isOverScreen = (direction: Direction, sprite: Sprite) => {
    let isOver = false;
    switch (direction) {
      case 'left':
        isOver = sprite.x <= -CARLENGTH / 2;
        break;
      case 'right':
        isOver = sprite.x >= WIDTH + CARLENGTH / 2;
        break;
      case 'top':
        isOver = sprite.y <= -CARLENGTH / 2;
        break;
      case 'bottom':
        isOver = sprite.y >= HEIGHT + CARLENGTH / 2;
        break;
    }
    if (!isOver) {
      return;
    }
    carData.current[direction] = carData.current[direction]!.next;
    app?.stage.removeChild(sprite);
    if (carData.current[direction]) {
      carData.current[direction]!.val.speed = Math.random() * 1 + 3;
    }
    addCar(direction);
  };

  /**
   * 是否有交叉轴的车在行驶，是否让行
   */
  const giveWay = (key: Direction): boolean => {
    let flag = false;
    let copyLeft = carData.current.left;
    let copyRight = carData.current.right;
    let copyTop = carData.current.top;
    let copyBottom = carData.current.bottom;
    // 纵轴交通灯范围
    let columnArea = {
      top: (HEIGHT - ROADWIDTH - CARLENGTH) / 2,
      bottom: (HEIGHT + ROADWIDTH + CARLENGTH) / 2,
    };

    // 横轴交通灯范围
    let rowArea = {
      left: (WIDTH - ROADWIDTH - CARLENGTH) / 2,
      right: (WIDTH + ROADWIDTH + CARLENGTH) / 2,
    };

    if (key === 'left' || key === 'right') {
      while (copyTop || copyBottom) {
        if (copyTop) {
          if (
            isExists({
              point: copyTop.val.y,
              start: columnArea.top,
              end: columnArea.bottom,
            })
          ) {
            flag = true;
          }
          copyTop = copyTop.next;
        }
        if (copyBottom) {
          if (
            isExists({
              point: copyBottom.val.y,
              start: columnArea.top,
              end: columnArea.bottom,
            })
          ) {
            flag = true;
          }
          copyBottom = copyBottom.next;
        }
      }
    } else {
      while (copyLeft) {
        if (copyLeft) {
          if (
            isExists({
              point: copyLeft.val.x,
              start: rowArea.left,
              end: rowArea.right,
            })
          ) {
            flag = true;
          }
          copyLeft = copyLeft.next;
        }
        if (copyRight) {
          if (
            isExists({
              point: copyRight.val.x,
              start: rowArea.left,
              end: rowArea.right,
            })
          ) {
            flag = true;
          }
          copyRight = copyRight.next;
        }
      }
    }
    return flag;
  };

  /**
   * 是否在范围内
   * @param param0
   * @returns
   */
  const isExists = ({
    point,
    start,
    end,
  }: {
    point: number;
    start: number;
    end: number;
  }) => {
    return point > start && point < end;
  };

  return (
    <ContextData.Provider
      value={{
        state,
        dispatch, // 把 dispatch 也作为 context 的一部分共享下去，从而在嵌套组件中调用以实现更新顶层的 state
      }}
    >
      <div className={styles.app}>
        <div>
          <canvas id="mainCanvas"></canvas>
        </div>
      </div>
    </ContextData.Provider>
  );
}

export default App;
