// 地方検索

import React from 'react'
import type { PokedexData } from '../../utilities/types/typesUtility';

// props
interface SearchRegionFilterProps {
  pokedexData: PokedexData[];
}

const SearchRegionFilter = ({pokedexData}:SearchRegionFilterProps):React.ReactNode => {

  // 地方一覧の生成
  const selectRegions = (): React.ReactNode => {
    // 流用元： renderMainModal.tsx > getAppRegion


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

    // 描画内容
    return uniqueRegions.map((region) => {
      return (
        <label className='region method' key={region.id}>
          <input type='checkbox' name='regionSearchMode' data-number={region.id}/>
          {region.name}
        </label>
      );
    });
  }


  // 描画内容
  return (
    <dl className='areaAppBase'>
      <dt className='areaAppTitle'>地方</dt>
      <dd className='areaAppContents'>{ selectRegions()}</dd>
    </dl>
  )
}

export default SearchRegionFilter