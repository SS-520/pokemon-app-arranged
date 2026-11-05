// 初出世代検索

import React from 'react';

interface SearchGenerationFilterProps {
  firstGenerationversionsData: Record<
    number,
    {
      id: number;
      name: string;
      generation: number;
    }[]
  >;
}

const SearchGenerationFilter = ({
  firstGenerationversionsData,
}: SearchGenerationFilterProps): React.ReactNode => {
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
              name='firstGenerationSearchMode'
              data-number={generation}
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
