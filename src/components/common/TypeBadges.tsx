// タイプ画像表示コンポーネント

import React from 'react'
import { types } from '../../utilities/dataInfo';

// スタイル
//  呼び出しごとに異なるため統一しない

// props
interface TypeBadgesProps {
  typeNumbers: number[];
}

const TypeBadges = ({ typeNumbers }: TypeBadgesProps): React.ReactNode => {
  
  // 型番号が渡ってこない場合、何も返さない
  if (!typeNumbers || typeNumbers.length === 0) return null;

  // 描画内容
  return (
    <React.Fragment>
      {typeNumbers.map((typeNum) => {
        const pokemonType = types.find((dataType) => dataType.number === typeNum);
        if (!pokemonType) return null;
        return (
          <img
            className='type'
            src={pokemonType.imgURL}
            alt={pokemonType.name}
            key={pokemonType.number}
          />
        );
      })}
    </React.Fragment>
  )
}

export default TypeBadges