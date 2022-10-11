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
  state?: 'running' | 'stopping';
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
      setInterval(() => {
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
      }, 1000);
    }
  }, [app, state.lightsData]);

  useEffect(() => {
    if (!app || !texture) {
      return;
    }
    loadSprite(
      'left',
      WIDTH - CATLENGTH / 2,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );
    loadSprite(
      'left',
      WIDTH + CATLENGTH * 2,
      (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4
    );
    let roadLightX = (WIDTH + ROADWIDTH + CATLENGTH) / 2;
    app.ticker.add(() => {
      let copyList = catList.current;
      let lastNode = null;
      while (copyList) {
        const sprite = copyList.val;
        if (roadLightX - sprite.x <= 2 && roadLightX - sprite.x >= 0) {
          if (isRowGreen.current) {
            sprite.x -= 1;
          }
        } else {
          sprite.x -= 1;
        }
        if (sprite.x <= 0) {
          return;
        }
        if (lastNode && Math.abs(sprite.x - lastNode.x) <= CATLENGTH + 3) {
          sprite.x = lastNode.x + CATLENGTH + 3;
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
    sprite.anchor.set(0.5);
    sprite.state = 'running';
    if (direction === 'left' || direction === 'right') {
      sprite.width = CATLENGTH;
      sprite.height = CATLENGTH / 1.5;
    } else {
      sprite.width = CATLENGTH / 1.5;
      sprite.height = CATLENGTH;
    }
    app.stage.addChild(sprite);
    if (catList.current) {
      catList.current.next = new ListNode(sprite);
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
