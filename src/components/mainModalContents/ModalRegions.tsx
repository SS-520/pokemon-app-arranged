// 登場地方セクション

import React from 'react'

// 型定義
import type { PokedexObj, PokedexData } from '../../utilities/types/typesUtility';

// props定義
interface ModalRegionsProps {
  pokedex: PokedexObj;
  pokedexData: PokedexData[];
  isDefault: boolean;
}

const ModalRegions = ({pokedex, pokedexData,isDefault}: ModalRegionsProps) => {

  // 地方一覧列挙＋登場地方列挙
const getAppRegion = (pokedex: PokedexObj, pokedexData: PokedexData[]) => {
  // 地方名一覧を取得
  const regions: PokedexData['region'][] = [...pokedexData].map((data) => {
    return data.region;
  });

  // 重複削除
  const uniqueRegionMap = new Map<number, PokedexData['region']>();
  [...regions].forEach((region) => {
    uniqueRegionMap.set(region.id, region);
  });

  // 重複を除いた地方一覧をMapから配列に戻す
  const uniqueRegions: PokedexData['region'][] = Array.from(
    uniqueRegionMap.values(),
  );

  // 表示element
  return uniqueRegions.map((region) => {
    const isRegion: boolean = pokedex.regionNames.includes(region.name);
    return (
      <dd
        className={`regionName tiles ${isRegion ? 'show' : ''}`}
        key={region.id}
      >
        {region.name}
      </dd>
    );
  });
};
  return (
    <React.Fragment>
      <dl className='appearanceRegions maskingTapeStyleBase'>
        <dt className='maskingTapeStyleTitle'>登場地方</dt>
        <dd className='ddContainer maskingTapeStyleContents'>
          {getAppRegion(pokedex, pokedexData)}
        </dd>
        {!isDefault && (
          <p className='annotation'>
            ※通常／リージョンフォームが登場する全地方が表示されます
          </p>
        )}
      </dl>
    </React.Fragment>
  )
}

export default ModalRegions
