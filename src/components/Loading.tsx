import { useEffect, useState } from 'react';
import '../scss/Loading.scss';
import type { BallDetails } from '../utilities/typesUtility';
import { balls } from '../utilities/dataInfo';

// ランダムでボールのを選んでアイコンを表示

function Loading() {
  // ボール種類をセット
  // ※index[0]=初期化用ダミーデータ
  const [ballType, setBallType] = useState<BallDetails>(balls[0]);

  // どのボールを表示するかランダムで選ぶ
  const randomBallSelect = (): void => {
    const randomBallNum: number = Math.floor(Math.random() * balls.length) + 1;
    setBallType(balls[randomBallNum]);
  };

  // コンポーネントを呼び出す初回だけrandom処理実行
  useEffect(() => {
    const controller = new AbortController();
    randomBallSelect();
    return () => {
      // 1回目の実行（マウント）直後に呼ばれるため、リクエストをキャンセルする
      controller.abort();
    };
  }, []);

  return (
    <div className='loading'>
      <img alt={`loadingAnimation（${ballType.name}）`} className='loadImg' src={ballType.imgURL} />
      <p>Now Loading...</p>
    </div>
  );
}

export default Loading;
