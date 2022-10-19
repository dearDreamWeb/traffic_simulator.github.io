import { createContext } from 'react';
import * as PIXI from 'pixi.js';

export interface StateProps {
  lightsData: Array<PIXI.Container<PIXI.DisplayObject>>;
  app: PIXI.Application | null;
  carFilterType: number;
}
//初始数据
const initData: StateProps = {
  lightsData: [],
  app: null,
  carFilterType: 0,
};

// 派发事件
const reducer = (
  state: StateProps,
  action: { type: string; payload?: any }
) => {
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
