// 地方検索

import React from 'react'
import { formatUniqueRegionList } from '../../utilities/function/utilityFunction';
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
    const uniqueRegions: PokedexData['region'][] = formatUniqueRegionList(pokedexData)

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
    <dl className='areaAppBase searchRegionArea' id='searchRegionArea'>
      <dt className='areaAppTitle regionTitle'>地方</dt>
      <dd className='areaAppContents regionContents'>{ selectRegions()}</dd>
    </dl>
  )
}

export default SearchRegionFilter