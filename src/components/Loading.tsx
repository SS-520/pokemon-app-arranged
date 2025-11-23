import React, { useEffect, useState } from 'react';
import '../scss/Loading.scss';
import type { BallDetails } from '../utilities/typesUtility';
import { balls } from '../utilities/dataInfo';

// ランダムでボールのを選んでアイコンを表示

function Loading() {
  // ボール種類をセット
  const [ballType, setBallType] = useState<BallDetails>(balls[0]);

  // どのボールを表示するかランダムで選ぶ
  const randomBallSelect = (): void => {
    const randomBallNum: number = Math.floor(Math.random() * balls.length);
    setBallType(balls[randomBallNum]);
  };

  // コンポーネントを呼び出す初回だけrandom処理実行
  useEffect(() => {
    randomBallSelect();
  }, []);

  return (
    <div className='loading'>
      <img alt={`loadingAnimation（${ballType.name}）`} className='loadImg' src={ballType.imgURL} />
      <p>Now Loading...</p>
    </div>
  );
}

export default Loading;
