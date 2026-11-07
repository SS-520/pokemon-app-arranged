// 初出世代検索

import React from 'react';
import type { SearchConditions } from '../../contexts/SearchConditions';

interface SearchGenerationFilterProps {
  firstGenerationversionsData: Record<
    number,
    {
      id: number;
      name: string;
      generation: number;
    }[]
  >;
  generations: SearchConditions['generations'];
  onGenerationsChange: (newGene: SearchConditions['generations']) => void;
}

const SearchGenerationFilter = ({
  firstGenerationversionsData,
  generations,
  onGenerationsChange,
}: SearchGenerationFilterProps): React.ReactNode => {
  // 検索対象押下時のハンドラ
  const handleGenerationChange = (checkedGenerationId: number) => {
    // 押下結果のID配列（解除true/追加false）
    const newGenerations: SearchConditions['regions'] = generations.includes(
      checkedGenerationId,
    )
      ? generations.filter((generations) => generations !== checkedGenerationId) // 解除
      : [...generations, checkedGenerationId]; // 追加

    // 結果で更新
    onGenerationsChange(newGenerations);
  };

  const selectFirstGenerations = (): React.ReactNode => {
    // versionsDataの結果を取得
    const groupedVersions = firstGenerationversionsData;

    // 描画内容
    return (
      <React.Fragment>
        {/* 世代別にループ */}
        {Object.entries(groupedVersions).map(([generation]) => (
          <label
            data-generation={generation}
            className={`generations gene${generation} method`}
            key={Number(generation)}
          >
            第{generation}世代
            <input
              type='checkbox'
              name='firstGenerationNumber'
              data-number={generation}
              checked={generations.includes(Number(generation))}
              onChange={() => handleGenerationChange(Number(generation))}
            />
          </label>
        ))}
      </React.Fragment>
    );
  };

  return (
    <section
      className='areaAppBase searchGenerationArea'
      id='searchGenerationArea'
      role='group'
      aria-labelledby='searchGenerationTitle'
    >
      <h3 className='areaAppTitle generationTitle' id='searchGenerationTitle'>
        初出世代
      </h3>
      <div className='areaAppContents generationContents'>
        {selectFirstGenerations()}
      </div>
    </section>
  );
};

export default SearchGenerationFilter;
