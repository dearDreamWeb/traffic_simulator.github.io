import { useState, useEffect, useRef } from 'react';
import styles from './App.module.less';
import * as PIXI from 'pixi.js';
import utils from './utils';

const { createRoad, roadLine } = utils;

const WIDTH = 800;
const HEIGHT = 800;
const ROADWIDTH = 100;

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let app = useRef<PIXI.Application>().current!;

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
  };

  return (
    <div className={styles.app}>
      <div>
        <canvas id="mainCanvas"></canvas>
      </div>
    </div>
  );
}

export default App;
