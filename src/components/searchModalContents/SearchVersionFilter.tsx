// 野生出現バージョン検索

import React from 'react'

// props
interface SearchVersionFilterProps {
  versionsData: Record<number, {
    id: number;
    name: string;
    generation: number;
}[]>;
}

// 本体
const SearchVersionFilter = ({ versionsData }: SearchVersionFilterProps): React.ReactNode => {

  // 内部処理
  const selectVersions = (): React.ReactNode => {
    // versionsDataの結果を取得
    const groupedVersions = versionsData;

    // グループ化されたデータを元にレンダリング
    return (
      <React.Fragment>
        {/* 世代別にループ */}
        {Object.entries(groupedVersions).map(
          ([generation, generationVersions]) => (
            <dd
              data-generation={generation}
              className={`generations gene${generation}`}
              key={Number(generation)}
            >
              <span className='generationNumber'>第{generation}世代</span>
              <span className='generationGroup'>
                {/* 世代内のオブジェクトでループ */}
                {generationVersions.map((version) => {
                  return (
                    <span className='version'>
                      <label
                        key={version.id}
                        data-version={version.id}
                        className={`versionName method `}
                      >
                        {version.name}
                        <input type='checkbox' name='versionSearchMode' data-number={version.id} />
                      </label>
                    </span>
                  );
                })}
              </span>
            </dd>
          ),
        )}
      </React.Fragment>
    );
  }

  // 描画内容
  return (
    <dl className='areaAppBase'>
      <dt className='areaAppTitle'>野生出現バージョン</dt>
      <dd className='areaAppContents'>{ selectVersions()}</dd>
    </dl>
  )
}

export default SearchVersionFilter