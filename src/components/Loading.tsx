import { useState } from 'react';
import type { BallDetails } from '../utilities/types/typesUtility';
import { balls } from '../utilities/dataInfo';

// スタイル
import '../scss/Loading.scss';

// ランダムでボールのを選んでアイコンを表示
function Loading() {
  // どのボールを表示するかランダムで選ぶ
  const randomBallSelect = (): BallDetails => {
    //  Math.random() * (個数) で、欲しい範囲の数を作る
    const randomBallNum: number = Math.floor(Math.random() * balls.length - 1) + 1;
    return balls[randomBallNum];
  };

  // ボール種類をセット
  // ※index[0]=初期化用ダミーデータ
  // 再セットはしないのでsetBallTypeは不要
  const [ballType] = useState<BallDetails>(randomBallSelect);
  // ※「()」をつけない
  // ⇒関数の内容だけ渡して、必要な時だけ実行される

  // imgはballType.imgURLが設定されてるときのみ表示
  return (
    <div className="loading">
      {ballType.imgURL ? <img alt={`loadingAnimation（${ballType.name}）`} className="loadImg" src={ballType.imgURL} /> : null}
      <p>Now Loading...</p>
    </div>
  );
}

export default Loading;
