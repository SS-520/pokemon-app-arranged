// 卵グループセクション

import React from 'react'

// 型定義
import type { EggDetails, LsPokemon } from '../../utilities/types/typesUtility';

// データ
import { eggs } from '../../utilities/dataInfo';

// props
interface ModalEggGroupsProps {
  pokemon: LsPokemon;
}

// 本体
const ModalEggGroups = ({ pokemon }: ModalEggGroupsProps): React.ReactNode => {

  // 描画処理
  const setEggGroupList = (pokemon: LsPokemon): React.ReactNode => {
  // 卵グループ一覧取得
  const eggGroup: EggDetails[] = eggs;
  return eggGroup.map((egg) => {
    const isEgg: boolean = pokemon.egg.includes(egg.number);
    return (
      <dd key={egg.number} className={`eggName tiles ${isEgg ? 'show' : ''}`}>
        {egg.name}
      </dd>
    );
  });
};

  return (
    <dl className='eggGroup maskingTapeStyleBase'>
      <dt className='maskingTapeStyleTitle'>卵グループ</dt>
      <div className='ddContainer maskingTapeStyleContents'>{setEggGroupList(pokemon)}</div>
    </dl>
  )
}

export default ModalEggGroups
