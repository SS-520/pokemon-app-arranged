// タイプ画像表示コンポーネント

import React from 'react'
import { types } from '../../utilities/dataInfo';
import type { TypeDetails } from '../../utilities/types/typesUtility';

// スタイル
//  呼び出しごとに異なるため統一しない

// types内の検索を高速化するためMapを事前作成
const typesMap: Map<number, TypeDetails> = new Map(types.map((typeObj)=>[typeObj.number, typeObj]))

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
        const pokemonType = typesMap.get(typeNum);  // ループごとに配列を探索するのではなく、Mapから該当番号を取得(O(1)で高速検索)
        if (!pokemonType) return null;  // 該当番号がなければnull
        return (
          <img
            className='type'
            src={pokemonType.imgURL}
            alt={pokemonType.name}
            key={pokemonType.number}
            loading='lazy'  // 表示されるまで読み込まない
            decoding='async'  // 裏で準備するからメイン処理を邪魔しない
          />
        );
      })}
    </React.Fragment>
  )
}

export default TypeBadges