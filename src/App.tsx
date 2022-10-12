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
const CATLENGTH = 50; // 车长

class ListNode {
  val: Sprite;
  next: ListNode | null;
  constructor(val: Sprite) {
    this.val = val;
    this.next = null;
  }
}

function App() {
  let [app, setApp] = useState<PIXI.Application>();
  const [state, dispatch] = useReducer(reducer, initData);
  let isRowGreen = useRef(true);
  let timerCount = useRef(0).current;
  let [texture, setTexture] = useState<TextureCacheObj>();
  let catList = useRef<ListNode | null>(null);

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
    loadSprite(
      'left',
      WIDTH - CATLENGTH / 2,
      // WIDTH + CATLENGTH * 2,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );

    loadSprite(
      'left',
      WIDTH + CATLENGTH * 2,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );

    loadSprite(
      'left',
      WIDTH + CATLENGTH * 3,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );

    loadSprite(
      'left',
      WIDTH + CATLENGTH * 4,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );

    let roadLightX = (WIDTH + ROADWIDTH + CATLENGTH) / 2;
    app.ticker.add(() => {
      let copyList = catList.current;
      // 上一节点
      let lastNode = null;
      while (copyList) {
        const sprite = copyList.val;
        // 是否停车
        let isStop = false;
        // 判断是否在红绿灯右侧 5 距离大小，在判断是否为红灯
        if (sprite.x - roadLightX <= 5 && sprite.x - roadLightX >= 0) {
          if (!isRowGreen.current) {
            isStop = true;
          }
        }
        // 判断汽车是否走出画面，链表中删除，并且从舞台中删除，在添加一辆车
        if (sprite.x <= 0) {
          catList.current = catList.current!.next;
          app?.stage.removeChild(sprite);
          if (catList.current) {
            catList.current.val.speed = Math.random() * 1 + 3;
          }
          loadSprite(
            'left',
            WIDTH - CATLENGTH / 2,
            // WIDTH + CATLENGTH * 2,
            (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
          );
        }
        // 判断距离上一辆车的距离是否小于3，小于3就等于3
        if (lastNode && Math.abs(sprite.x - lastNode.x) <= CATLENGTH + 4) {
          sprite.x = lastNode.x + CATLENGTH + 4;
          if (sprite.state !== 'slowDown') {
            sprite.speed = lastNode.speed - Math.random() * lastNode.speed;
            sprite.state = 'slowDown';
          }
          isStop = true;
        } else if (
          lastNode &&
          Math.abs(sprite.x - lastNode.x) > CATLENGTH + 30
        ) {
          if (sprite.state !== 'accelerate') {
            sprite.speed = sprite.speed + Math.random() * (4 - sprite.speed);
            sprite.state = 'accelerate';
          }
        }

        if (!isStop) {
          sprite.x -= sprite.speed;
        }

        lastNode = sprite;
        copyList = copyList.next;
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

  const loadSprite = (
    direction: 'left' | 'right' | 'top' | 'bottom',
    x = 0,
    y = 0
  ) => {
    if (!app) {
      return;
    }
    let sprite = new PIXI.Sprite(texture![direction]) as Sprite;
    sprite.x = x;
    sprite.y = y;
    sprite.id = Math.floor(Math.random() * 999999);
    sprite.speed = !catList.current
      ? Math.random() * 1 + 3
      : 1 + Math.random() * 3;
    sprite.anchor.set(0.5);
    sprite.state = 'normal';
    if (direction === 'left' || direction === 'right') {
      sprite.width = CATLENGTH;
      sprite.height = CATLENGTH / 1.5;
    } else {
      sprite.width = CATLENGTH / 1.5;
      sprite.height = CATLENGTH;
    }
    app.stage.addChild(sprite);

    // 链表最后添加节点
    if (catList.current) {
      let current = catList.current;
      while (current.next) {
        current = current.next!;
      }
      current.next = new ListNode(sprite);
    } else {
      catList.current = new ListNode(sprite);
    }
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
