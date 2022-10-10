import { useState, useEffect, useRef, useReducer } from 'react';
import styles from './App.module.less';
import * as PIXI from 'pixi.js';
import utils from './utils';
import { reducer, ContextData, initData, InitData } from './reducer/useReducer'; //引入useReducer文件

const { createRoad, roadLine, createLights } = utils;

const WIDTH = 800;
const HEIGHT = 800;
const ROADWIDTH = 100;
const LIGHTALPHA = 0.06;
const REDLIGHTTIMER = 6; // 红灯秒数

function App() {
  let app = useRef<PIXI.Application>().current!;
  const [state, dispatch] = useReducer(reducer, initData);
  let isRowGreen = useRef(true).current;
  let timerCount = useRef(0).current;

  useEffect(() => {
    app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      antialias: true,
      transparent: false,
      resolution: 1,
      view: document.getElementById('mainCanvas') as HTMLCanvasElement,
    });
    init();
  }, []);

  useEffect(() => {
    const { lightsData } = state;
    if (lightsData.length === 4) {
      setInterval(() => {
        let isDiff3 = REDLIGHTTIMER - timerCount;
        if (isRowGreen) {
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
        timerCount++;
        if (timerCount > REDLIGHTTIMER) {
          isRowGreen = !isRowGreen;
          timerCount = 0;
        }
      }, 1000);
    }
  }, [state.lightsData]);

  const init = () => {
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
