// 地方検索

import React from 'react';
import { formatUniqueRegionList } from '../../utilities/function/utilityFunction';
import type { PokedexData } from '../../utilities/types/typesUtility';
import { usePokemonData } from '../../contexts/PokemonDataContext';
import type { SearchConditions } from '../../contexts/SearchConditions';

// props
interface SearchRegionFilterProps {
  regions: SearchConditions['regions'];
  onRegionsChange: (newRegions: SearchConditions['regions']) => void;
}

const SearchRegionFilter = ({
  regions,
  onRegionsChange,
}: SearchRegionFilterProps): React.ReactNode => {
  // contextでデータを受け取る
  const { pokedexData } = usePokemonData();

  // 検索対象押下時のハンドラ
  const handleRegionChange = (checkedRegionId: PokedexData['region']['id']) => {
    // 押下結果のID配列（解除true/追加false）
    const newRegions: SearchConditions['regions'] = regions.includes(
      checkedRegionId,
    )
      ? regions.filter((region) => region !== checkedRegionId) // 解除
      : [...regions, checkedRegionId]; // 追加

    // 結果で更新
    onRegionsChange(newRegions);
  };

  // 地方一覧の生成
  const selectRegions = (): React.ReactNode => {
    // 流用元： renderMainModal.tsx > getAppRegion

    // 地方名一覧を取得
    const uniqueRegions: PokedexData['region'][] =
      formatUniqueRegionList(pokedexData);

    // 描画内容
    return uniqueRegions.map((region) => {
      return (
        <label className='region method' key={region.id}>
          <input
            type='checkbox'
            name='regionSearchMode'
            data-number={region.id}
            checked={regions.includes(region.id)} // 選択済み配列に現在のIDが含まれていたらtrue
            onChange={() => handleRegionChange(region.id)}
          />
          {region.name}
        </label>
      );
    });
  };

  // 描画内容
  return (
    <section
      className='areaAppBase searchRegionArea'
      id='searchRegionArea'
      role='group'
      aria-labelledby='searchRegionTitle'
    >
      <h3 className='areaAppTitle regionTitle' id='searchRegionTitle'>
        地方
      </h3>
      <div className='areaAppContents regionContents'>{selectRegions()}</div>
    </section>
  );
};

export default SearchRegionFilter;
