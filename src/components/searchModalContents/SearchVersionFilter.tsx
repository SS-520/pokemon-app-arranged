// 野生出現バージョン検索

import React, { useState } from 'react'

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

  // ハンドラ関数定義
  // 選択中のバージョンID一覧をSetで管理（O(1)で高速判定！）
  const [selectedVersionIds, setSelectedVersionIds] = useState<Set<number>>(new Set());

  // 世代チェックボックスの切り替え（内包する全バージョンを一括ON/OFF）
  const handleGenerationChange = (
    generationVersions: { id: number } [],
    isChecked: boolean,
  ) => {
    // selectedVersionIdsを更新
    setSelectedVersionIds((prevVersionIds) => {
      // Setのコピーを作成（以降はコピー側を走査）
      const nextVersionIds = new Set(prevVersionIds);
      // 世代内のバージョンをループ
      generationVersions.forEach((version) => {
        // チェック状態に応じてIDを追加または削除
        if (isChecked) {
          nextVersionIds.add(version.id)  // 追加⇒チェックオン
        } else {
          nextVersionIds.delete(version.id)  // 削除⇒チェックオフ
        }
      })
      // 新しいSetを返す（全部チェックorチェックオフの状態を返す）
      return nextVersionIds;
    });
  };
  
  // 個別バージョンチェックボックスの切り替え
  const handleVersionChange  = (
    versionId: number,
    isChecked: boolean,
  ) => { 
    setSelectedVersionIds((prevVersionIds) => {
      const nextVersionIds = new Set(prevVersionIds);
      
      if(isChecked) {
        nextVersionIds.add(versionId)
      }else {
        nextVersionIds.delete(versionId)
      }
      return nextVersionIds;
    })
  }


  // 内部処理
  const selectVersions = (): React.ReactNode => {
    // versionsDataの結果を取得
    const groupedVersions = versionsData;

    // グループ化されたデータを元にレンダリング
    return (
      <React.Fragment>
        {/* 世代別にループ */}
        {Object.entries(groupedVersions).map(
          ([generation, generationVersions]) => {
          // その世代の全バージョンが選択されているか判定（派生ステート）
          const isAllChecked = generationVersions.length > 0 && generationVersions.every((version)=>selectedVersionIds.has(version.id))
          
          return (
            <dd
              id={`gene${generation}`}
              data-generation={generation}
              className={`generations gene${generation}`}
              key={Number(generation)}
            >
              <label className='generationNumber method'>第{generation}世代
                <input
                  type='checkbox'
                  name='versionGenerationSearchMode'
                  data-number={generation}
                  checked={isAllChecked}
                  onChange={(event)=>handleGenerationChange(generationVersions,event.target.checked)} // チェックした時に発火
                />
              </label>
              <span className='generationGroup'>
                {/* 世代内のオブジェクトでループ */}
                {generationVersions.map((version) => {
                  // 対象のバージョンが選択されてるかの判定
                  const isChecked = selectedVersionIds.has(version.id);

                  return (
                    <span className='version'>
                      <label
                        key={version.id}
                        data-version={version.id}
                        className={`versionName method `}
                      >
                        {version.name}
                        <input
                          type='checkbox'
                          name='versionSearchMode'
                          data-number={version.id}
                          checked={isChecked}
                          onChange={(event) => handleVersionChange(version.id, event.target.checked)} // チェックした時に発火
                        />
                      </label>
                    </span>
                  );
                })}
              </span>
            </dd>
          )}
        )}
      </React.Fragment>
    );
  }

  // 描画内容
  return (
    <dl className='areaAppBase searchVersionArea' id='searchVersionArea'>
      <dt className='areaAppTitle versionTitle'>野生出現バージョン</dt>
      <dd className='areaAppContents versionContents'>{ selectVersions()}</dd>
    </dl>
  )
}

export default SearchVersionFilter