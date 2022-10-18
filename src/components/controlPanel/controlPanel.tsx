import { useState, useContext } from 'react';
import styles from './controlPanel.module.less';
import startBtn from '../../assets/images/start_btn1.png';
import stopBtn from '../../assets/images/stop_btn.png';
import { ContextData, StateProps } from '../../reducer/useReducer'; //引入useReducer文件

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
