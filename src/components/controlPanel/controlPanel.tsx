import { useState, useContext, useRef, useEffect } from 'react';
import styles from './controlPanel.module.less';
import startBtn from '../../assets/images/start_btn1.png';
import stopBtn from '../../assets/images/stop_btn.png';
import { ContextData, StateProps } from '../../reducer/useReducer'; //引入useReducer文件
import Stats from 'stats.js';

interface ContextProps {
  state: StateProps;
  dispatch: {
    type: string;
    payload?: any;
  };
}

export default function ControlPanel() {
  const { state, dispatch } = useContext(ContextData) as ContextProps;
  const { app } = state as StateProps;
  const [playState, setPlayState] = useState(true);
  const statsDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initStats();
  }, []);

  const initStats = () => {
    let stats = new Stats();
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
    </div>
  );
}
