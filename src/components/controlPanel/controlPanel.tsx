import { useState, useContext, useRef, useEffect } from 'react';
import styles from './controlPanel.module.less';
import startBtn from '../../assets/images/start_btn1.png';
import stopBtn from '../../assets/images/stop_btn.png';
import { ContextData, StateProps } from '../../reducer/useReducer'; //引入useReducer文件
import Stats from 'stats.js';
import cartYellowLeft from '../../assets/images/cart_yellow_left.png';
import cartGrayLeft from '../../assets/images/cart_gray_left.png';

interface ContextProps {
  state: StateProps;
  dispatch: any;
}
const carManageList = [
  { key: '0', label: '原始模式' },
  { key: '1', label: '多彩模式' },
  { key: '2', label: '多彩闪光模式' },
  { key: '3', label: '简笔画模式' },
];

const carListDefault = [
  {
    key: '0',
    url: cartYellowLeft,
    disabled: false,
  },
  {
    key: '1',
    url: cartGrayLeft,
    disabled: false,
  },
];

export default function ControlPanel() {
  const { state, dispatch } = useContext(ContextData) as ContextProps;
  const { app, useCarList } = state as StateProps;
  const [playState, setPlayState] = useState(true);
  const statsDom = useRef<HTMLDivElement>(null);
  const [stats] = useState(new Stats());
  const [selectIndex, setSelectIndex] = useState(0);
  const [carList, setCarList] = useState(carListDefault);

  useEffect(() => {
    initStats();
    return () => {
      stats.dom.remove();
    };
  }, []);

  const initStats = () => {
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.position = 'relative';
    statsDom.current!.appendChild(stats.dom);

    function animate() {
      stats.begin();
      stats.end();
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };

  const playBtnClick = () => {
    if (playState) {
      app?.ticker.stop();
    } else {
      app?.ticker.start();
    }
    setPlayState(!playState);
  };

  const selectTypeHandler = (index: number) => {
    setSelectIndex(index);
    dispatch({ type: 'updateState', payload: { carFilterType: index } });
  };

  const carManage = (index: number) => {
    const list = JSON.parse(JSON.stringify(carList));
    list[index].disabled = !list[index].disabled;
    let arr = list
      .filter((item: any) => !item.disabled)
      .map((_item: any) => Number(_item.key));
    dispatch({ type: 'updateState', payload: { useCarList: arr } });
    setCarList(list);
  };

  return (
    <div className={styles.main}>
      <div className={styles.rightContent}>
        <div ref={statsDom} className={styles.statsMain}></div>
        <img
          className={styles.playBtn}
          src={playState ? stopBtn : startBtn}
          title={playState ? '暂停' : '开始'}
          alt="按钮"
          width={50}
          height={50}
          onClick={playBtnClick}
        />
      </div>
      <div className={styles.leftContent}>
        <h1 className={styles.title}>交通模拟器 🚥，😎skr~</h1>
        <ul className={styles.radioMain}>
          {carManageList.map((item, index) => {
            return (
              <li key={item.key} onClick={() => selectTypeHandler(index)}>
                <input
                  type="radio"
                  name="radio"
                  id={`radio_${index}`}
                  value={index}
                  checked={selectIndex === index}
                />
                <label htmlFor={`radio_${index}`}>{item.label}</label>
              </li>
            );
          })}
        </ul>
        <h2 className={styles.subTitle}>
          车辆管理
          <span>（提示：至少要有一辆车）</span>
        </h2>
        <ul className={styles.carList}>
          {carList.map((item, index) => {
            return (
              <li key={item.key}>
                <button
                  onClick={() => carManage(index)}
                  className={`${styles.useBtn} ${
                    item.disabled ? styles.use : styles.disabled
                  }`}
                  disabled={!item.disabled && useCarList.length === 1}
                >
                  {item.disabled ? '启用' : '禁止'}
                </button>
                <img src={item.url} width={60} height={30} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
