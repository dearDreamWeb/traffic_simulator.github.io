import { useState, useContext, useRef, useEffect } from 'react';
import styles from './controlPanel.module.less';
import startBtn from '../../assets/images/start_btn1.png';
import stopBtn from '../../assets/images/stop_btn.png';
import { ContextData, StateProps } from '../../reducer/useReducer'; //引入useReducer文件
import Stats from 'stats.js';

interface ContextProps {
  state: StateProps;
  dispatch: any;
}

export default function ControlPanel() {
  const { state, dispatch } = useContext(ContextData) as ContextProps;
  const { app } = state as StateProps;
  const [playState, setPlayState] = useState(true);
  const statsDom = useRef<HTMLDivElement>(null);
  const [stats] = useState(new Stats());
  const [selectIndex, setSelectIndex] = useState(0);

  const carManageList = [
    { key: '0', label: '原始模式' },
    { key: '1', label: '多彩模式' },
    { key: '2', label: '多彩闪光模式' },
    { key: '3', label: '简笔画模式' },
  ];

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
        <h1 className={styles.title}>车辆管理</h1>
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
      </div>
    </div>
  );
}
