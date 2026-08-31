import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

// 呼び出し関数・型
import { type LsPokemon, type MainModalHandle, type PokedexData } from '../utilities/types/typesUtility';

// アイコン
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoMdHelpCircleOutline } from 'react-icons/io';
import { IoMdMale, IoMdFemale } from 'react-icons/io';

// CSS呼び出し
import '../scss/SearchModal.scss';
import { types } from '../utilities/dataInfo';
import { getVersions } from '../utilities/function/utilityFunction';

interface SearchProps {
  ref: React.Ref<MainModalHandle>;
  allData: LsPokemon[];
  pokedexData: PokedexData[];
  onClose: () => void;
}

const Search = ({ ref, allData, pokedexData, onClose }: SearchProps) => {
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /**
   * モーダルを閉じる共通処理
   */
  const searchModalClose = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }

    // モーダルが消える瞬間のガタつきを抑え
    // ブラウザに無理のないタイミングで状態を切り替えてもらう
    requestAnimationFrame(() => {
      onClose();
    });
  };

  // useImperativeHandle で 親が子の内部メソッドを呼び出せる
  // useImperativeHandle(プロップスref, 公開関数, アクティブリスト（オプショナル）)
  useImperativeHandle(ref, () => ({
    // 変数名: () =>{HTMLDialogElementのインスタンスメソッド}  で設定
    // 親側で変数を叩くと子側の機能が発火

    // モーダルを開く
    showModal: () => {},
    // モーダルを閉じる
    closeModal: () => {
      searchModalClose();
    },
  }));

  /**
   * モーダル起動制御
   */
  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      // フォーカスによる自動スクロール移動を防止
      // preventScroll: true を使用して初回トップ戻りを防止
      dialogRef.current.focus({ preventScroll: true });
    }
  }, []);

  /**
   * ダイアログのバックドロップ（外側）クリック判定
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      searchModalClose();
    }
  };

  //
  // キーワード検索の状態管理
  const defaultPlaceholder = 'ピカチュウ(名前) または 25(図鑑番号)';
  const [keywordPlaceholder, setKeywordPlaceholder] =
    useState<string>(defaultPlaceholder);

  /**
   * キーワード検索のモード変更
   * ・
   */
  const changeKeywordMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'searchNameOrDexNo') {
      setKeywordPlaceholder('ピカチュウ(名前) または 25(図鑑番号)');
    } else if (event.target.id === 'searchFormName') {
      setKeywordPlaceholder('アローラ キョダイマックス メガ');
    }
  };


  /*  検索項目生成 */

  // タイプ  
  const selectTypes = ():React.ReactNode => {
    return types.map((type) => {
      return (
        <label className='type method' key={type.number}>
          <input type='checkbox' name='typeSearchMode' data-number={type.number}/>
          <img src={type.imgURL} alt={type.name} />
        </label>
      );
    });
  }

  // 地方
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

  // バージョン・世代関連
  // 流用元： renderMainModal.tsx > encountVersionList
  const versionsData = ():Record<number, {
    id: number;
    name: string;
    generation: number;
}[]> => {
    // 1. バージョン一覧を取得
    //    全件検索なので第二引数は指定なし
    const versions: PokedexData['vGroup'][number]['version'] =
      getVersions(pokedexData);

    // 2. データを世代ごとにversionsをグループ化する
    const groupedVersions: Record<
      number,
      {
        id: number;
        name: string;
        generation: number;
      }[]
    > = versions.reduce(
      (accumulator, version) => {
        if (!accumulator[version.generation]) {
          // 蓄積データに[gen]の箱がない
          // ⇒新規の空配列作成
          accumulator[version.generation] = [];
        }
        // 蓄積配列にversionオブジェクトを突っ込んで返す
        accumulator[version.generation].push(version);
        return accumulator;
      },
      {} as Record<number, PokedexData['vGroup'][number]['version']>, // 初期値の型を明示,
      );
    
    return groupedVersions;
  }

  // 野生登場バージョン
  const selectVersions = (): React.ReactNode => {
    // versionsDataの結果を取得
    const groupedVersions = versionsData();

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
                      <input type='checkbox' name='versionSearchMode' data-number={version.id}/>
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

  // 初出世代
  const selectFirstGenerations = (): React.ReactNode => {
    // versionsDataの結果を取得
    const groupedVersions = versionsData();

    // 描画内容
    return (
      <React.Fragment>
        {/* 世代別にループ */}
        {Object.entries(groupedVersions).map(
          ([generation]) => (
            <label
              data-generation={generation}
              className={`generations gene${generation} method`}
              key={Number(generation)}
            >
              <span className='generationNumber'>第{generation}世代</span>
              <input type='checkbox' name='firstGenerationSearchMode' data-number={generation}/>
            </label>
          ),
        )}
      </React.Fragment>
    );

  }


  // 描画内容
  return (
    <dialog
      ref={dialogRef}
      onCancel={searchModalClose}
      onClick={handleBackdropClick}
      className='searchModal'
      id='searchModal'
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBackdropClick(
            e as unknown as React.MouseEvent<HTMLDialogElement>,
          );
        }
      }}
    >
      <button className='modalCloseButton' onClick={searchModalClose}>
        <IoIosCloseCircleOutline />
      </button>
      <section className='searchSection'>
        <header>
          <h2>検索条件</h2>
          <IoMdHelpCircleOutline className='helpIcon' />
          {/* 押下でヘルプモーダル出す */}
        </header>
        <section className='searchContents'>
          <dl className='keywordSearch areaAppBase'>
            <dt className='searchTarget areaAppTitle'>名前／図鑑番号</dt>
            <div className='searchOptions areaAppContents'>
              <dd>
                <label className='method'>
                  <input
                    type='radio'
                    name='keywordSearchMode'
                    id='searchNameOrDexNo'
                    onChange={changeKeywordMode}
                    defaultChecked
                  />
                  名前・図鑑番号
                </label>
                <label className='method'>
                  <input
                    type='radio'
                    name='keywordSearchMode'
                    id='searchFormName'
                    onChange={changeKeywordMode}
                  />
                  フォルム名
                </label>
              </dd>
              <input
                type='text'
                id='searchKeyword'
                placeholder={`例：${keywordPlaceholder}`}
              />
            </div>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>
              <IoMdMale />
              <IoMdFemale />
              差分
            </dt>
            <dd className='areaAppContents'>
              <label className='method'>
                <input type='radio' name='gender' defaultChecked />
                全て
              </label>
              <label className='method'>
                <input type='radio' name='gender' /> 差分有
              </label>
              <label className='method'>
                <input type='radio' name='gender' /> 差分無
              </label>
            </dd>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>タイプ</dt>
            <div className='areaAppContents'>
              <dd>
                <label className='method'>
                  <input type='radio' name='typeSearchMode' defaultChecked />
                  OR検索
                </label>
                <label className='method'>
                  <input type='radio' name='typeSearchMode' />
                  AND検索（複合タイプ）
                </label>
              </dd>
              <dd className='selectTypeArea'>
                {selectTypes()}
              </dd>
            </div>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>地方</dt>
            <dd className='areaAppContents'>{ selectRegions()}</dd>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>野生出現バージョン</dt>
            <dd className='areaAppContents'>{ selectVersions()}</dd>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>初出世代</dt>
            <dd className='areaAppContents'>{ selectFirstGenerations()}</dd>
          </dl>
        </section>
        <div className='buttonArea'>
          <button className='resetButton'>全リセット</button>
          <button className='searchButton'>検索</button>
        </div>
      </section>
    </dialog>
  );
};

export default Search;
