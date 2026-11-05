// 登場地方セクション

import React from 'react';
import { formatUniqueRegionList } from '../../utilities/function/utilityFunction';

// 型定義
import type {
  PokedexObj,
  PokedexData,
} from '../../utilities/types/typesUtility';

// props定義
interface ModalRegionsProps {
  pokedex: PokedexObj;
  pokedexData: PokedexData[];
  isDefault: boolean;
}

const ModalRegions = ({
  pokedex,
  pokedexData,
  isDefault,
}: ModalRegionsProps) => {
  // 地方一覧列挙＋登場地方列挙
  const getAppRegion = (pokedex: PokedexObj, pokedexData: PokedexData[]) => {
    // 地方名一覧を取得
    const uniqueRegions: PokedexData['region'][] =
      formatUniqueRegionList(pokedexData);

    // 表示element
    return uniqueRegions.map((region) => {
      const isRegion: boolean = pokedex.regionNames.includes(region.name);
      return (
        <li
          className={`regionName tiles ${isRegion ? 'show' : ''}`}
          key={region.id}
        >
          {region.name}
        </li>
      );
    });
  };
  return (
    <section className='appearanceRegions maskingTapeStyleBase'>
      <h3 className='maskingTapeStyleTitle'>登場地方</h3>
      <ul className='ulContainer maskingTapeStyleContents'>
        {getAppRegion(pokedex, pokedexData)}
      </ul>
      {!isDefault && (
        <p className='annotation'>
          ※通常／リージョンフォームが登場する全地方が表示されます
        </p>
      )}
    </section>
  );
};

export default ModalRegions;
