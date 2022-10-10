import { createContext } from 'react';
import * as PIXI from 'pixi.js';

export interface InitData {
  lightsData: Array<PIXI.Container<PIXI.DisplayObject>>;
}
//初始数据
const initData: InitData = {
  lightsData: [],
};

// 派发事件
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'addLight':
      return { ...state, lightsData: [...state.lightsData, action.payload] };
    case 'updateState':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const ContextData = createContext({});

export { initData, reducer, ContextData };
