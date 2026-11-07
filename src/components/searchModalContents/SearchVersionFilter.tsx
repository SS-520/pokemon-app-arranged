// 野生出現バージョン検索

import React from 'react';
import type { SearchConditions } from '../../contexts/SearchConditions';

// props
interface SearchVersionFilterProps {
  versionsData: Record<
    number,
    {
      id: number;
      name: string;
      generation: number;
    }[]
  >;
  versions: SearchConditions['versions'];
  onVersionsChange: (newVer: SearchConditions['versions']) => void;
}

// 本体
const SearchVersionFilter = ({
  versionsData,
  versions,
  onVersionsChange,
}: SearchVersionFilterProps): React.ReactNode => {
  // ハンドラ関数定義

  // 世代チェックボックスの切り替え（内包する全バージョンを一括ON/OFF）
  const handleGenerationChange = (
    generationVersions: {
      id: number;
      name: string;
      generation: number;
    }[],
    isTargetChecked: boolean,
  ) => {
    // 各世代オブジェクトに含まれる、ソフトのバージョンIDだけを抽出して配列化
    const targetGenerationVersions: number[] = generationVersions.map(
      (version) => version.id,
    );

    // 新しいバージョン配列を入れる変数用意
    let newVersions: number[] = [];

    // 今周の世代番号にチェック入ってる？
    if (isTargetChecked) {
      // チェック入り
      // 元のversionsに世代のバージョンIDが含まれてなかったら追加する
      newVersions = [...versions]; // 新規用の箱に元配列コピー

      // 対象世代のバージョンID配列全部に対して、「IDがnewVersionsに含有なしならnewVersionsに追加」
      targetGenerationVersions.forEach((versionId) => {
        if (!newVersions.includes(versionId)) {
          newVersions.push(versionId);
        }
      });
    } else {
      // チェック無⇒検索対象バージョンに含まれてたら除去
      newVersions = versions.filter(
        (versionId) => !targetGenerationVersions.includes(versionId),
      );
    }

    // 新しい検索対象の配列を更新
    onVersionsChange(newVersions);
  };

  // 個別バージョンチェックボックスの切り替え
  const handleVersionChange = (checkedVersionId: number) => {
    // 押したIDは元配列に含まれてる？
    const newVersions: SearchConditions['versions'] = versions.includes(
      checkedVersionId,
    )
      ? versions.filter((version) => version !== checkedVersionId) // 含む⇒チェックを外した処理⇒配列から対象除去
      : [...versions, checkedVersionId]; // 含まない⇒追加

    // 更新関数
    onVersionsChange(newVersions);
  };

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
            const isAllChecked =
              generationVersions.length > 0 &&
              generationVersions.every((version) =>
                versions.includes(version.id),
              );

            return (
              <span
                id={`gene${generation}`}
                data-generation={generation}
                className={`generations gene${generation}`}
                key={Number(generation)}
              >
                <label className='generationNumber method'>
                  第{generation}世代
                  <input
                    type='checkbox'
                    name='versionGenerationSearchMode'
                    data-number={generation}
                    checked={isAllChecked}
                    onChange={(event) =>
                      handleGenerationChange(
                        generationVersions,
                        event.target.checked,
                      )
                    } // チェックした時に発火
                  />
                </label>
                <span
                  className='generationGroup'
                  role='group'
                  aria-label='バージョン選択'
                >
                  {/* 世代内のオブジェクトでループ */}
                  {generationVersions.map((version) => {
                    // key属性は一番外の要素に付与⇒ループ内の最小の変更でDOMを生成（DOM再利用を促す）
                    return (
                      <span className='version' key={version.id}>
                        <label
                          data-version={version.id}
                          className={`versionName method `}
                        >
                          {version.name}
                          <input
                            type='checkbox'
                            name='versionSearchMode'
                            data-number={version.id}
                            checked={versions.includes(version.id)}
                            onChange={() => handleVersionChange(version.id)} // チェックした時に発火
                          />
                        </label>
                      </span>
                    );
                  })}
                </span>
              </span>
            );
          },
        )}
      </React.Fragment>
    );
  };

  // 描画内容
  return (
    <section
      className='areaAppBase searchVersionArea'
      id='searchVersionArea'
      role='group'
      aria-labelledby='searchVersionTitle'
    >
      <h3 className='areaAppTitle versionTitle' id='searchVersionTitle'>
        野生出現バージョン
      </h3>
      <div className='areaAppContents versionContents'>{selectVersions()}</div>
    </section>
  );
};

export default SearchVersionFilter;
