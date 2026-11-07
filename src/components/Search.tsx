import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';

// 呼び出し関数・型
import { type MainModalHandle } from '../utilities/types/typesUtility';

// アイコン
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoMdHelpCircleOutline } from 'react-icons/io';

// CSS呼び出し
import '../scss/SearchModal.scss';
import {
  formatUniqueVersionList,
  groupVersionsByGeneration,
} from '../utilities/function/utilityFunction';
import SearchKeywordFilter from './searchModalContents/SearchKeywordFilter';
import SearchGenderFilter from './searchModalContents/SearchGenderFilter';
import SearchTypeFilter from './searchModalContents/SearchTypeFilter';
import SearchRegionFilter from './searchModalContents/SearchRegionFilter';
import SearchVersionFilter from './searchModalContents/SearchVersionFilter';
import SearchGenerationFilter from './searchModalContents/SearchGenerationFilter';
import SearchButton from './searchModalContents/SearchButton';
import { usePokemonData } from '../contexts/PokemonDataContext';
import {
  initialSearchConditions,
  type SearchConditions,
} from '../contexts/SearchConditions';

interface SearchProps {
  ref: React.Ref<MainModalHandle>;
}

const Search = ({ ref }: SearchProps) => {
  //

  // contextからデータを受け取る
  const { pokedexData } = usePokemonData();

  // 検索条件の情報の設定
  const [condition, setCondition] = useState<SearchConditions>(
    initialSearchConditions,
  );

  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /**
   * 検索条件の入力欄・チェックボックスを全初期化する処理
   */

  const handleResetForm = () => {
    // 条件を初期化
    setCondition(initialSearchConditions);
  };

  /**
   * モーダルを閉じる共通処理
   */
  const searchModalClose = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  };

  // useImperativeHandle で 親が子の内部メソッドを呼び出せる
  // useImperativeHandle(プロップスref, 公開関数, アクティブリスト（オプショナル）)
  useImperativeHandle(ref, () => ({
    // 変数名: () =>{HTMLDialogElementのインスタンスメソッド}  で設定
    // 親側で変数を叩くと子側の機能が発火

    // モーダルを開く
    showModal: () => {
      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
        // フォーカスによる自動スクロール移動を防止
        // preventScroll: true を使用して初回トップ戻りを防止
        dialogRef.current.focus({ preventScroll: true });
      }
    },
    // モーダルを閉じる
    closeModal: () => {
      searchModalClose();
    },
  }));

  /**
   * ダイアログのバックドロップ（外側）クリック判定
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      searchModalClose();
    }
  };

  /*  検索項目生成 */

  // バージョン・世代関連
  // 流用元： renderMainModal.tsx > encountVersionList
  // pokedexData依存⇒pokedexDataが変わらない限りデータは再生成しない⇒memo化してコストを下げる
  const groupedVersionsData = useMemo<
    Record<number, { id: number; name: string; generation: number }[]>
  >(() => {
    // 1. バージョン一覧を取得
    const versions = formatUniqueVersionList(pokedexData);
    // 2. データを世代ごとにversionsをグループ化⇒返す
    return groupVersionsByGeneration(versions);
  }, [pokedexData]); // pokedexDataの変更時のみ再計算

  // 描画内容
  return (
    <dialog
      ref={dialogRef}
      onCancel={searchModalClose}
      onClick={handleBackdropClick}
      className='searchModal'
      id='searchModal'
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
        <div className='searchContents'>
          {/* 検索モーダルコンポーネント化したキーワード検索部分をここに */}
          <SearchKeywordFilter
            // 検索時に使う情報値とその変更関数をコンポーネントと連動
            keyword={condition.keyword}
            matchType={condition.keywordMatchType}
            onKeywordChange={(newVal: SearchConditions['keyword']) =>
              setCondition((prevVal) => ({ ...prevVal, keyword: newVal }))
            }
            onMatchTypeChange={(
              newType: SearchConditions['keywordMatchType'],
            ) =>
              setCondition((prevType) => ({
                ...prevType,
                keywordMatchType: newType,
              }))
            }
          />

          {/* 性別差分選択 */}
          <SearchGenderFilter
            genderDiff={condition.genderDiff}
            onGenderDiffChange={(newDiff: SearchConditions['genderDiff']) =>
              setCondition((preVal) => ({ ...preVal, genderDiff: newDiff }))
            }
          />

          {/* タイプ選択 */}
          <SearchTypeFilter
            selectedTypes={condition.types}
            typeMatchType={condition.typeMatchType}
            onSelectTypesChange={(newTypes: SearchConditions['types']) =>
              setCondition((preVal) => ({ ...preVal, types: newTypes }))
            }
            onTypeMatchTypeChange={(
              newTypeMatchType: SearchConditions['typeMatchType'],
            ) =>
              setCondition((preVal) => ({
                ...preVal,
                typeMatchType: newTypeMatchType,
              }))
            }
          />

          {/* 地方検索 */}
          <SearchRegionFilter
            regions={condition.regions}
            onRegionsChange={(newRegions: SearchConditions['regions']) =>
              setCondition((preVal) => ({ ...preVal, regions: newRegions }))
            }
          />

          {/* 野生登場バージョン */}
          <SearchVersionFilter
            versionsData={groupedVersionsData}
            versions={condition.versions}
            onVersionsChange={(newVer: SearchConditions['versions']) =>
              setCondition((preVal) => ({ ...preVal, versions: newVer }))
            }
          />

          {/* 初出世代 */}
          <SearchGenerationFilter
            firstGenerationversionsData={groupedVersionsData}
            generations={condition.generations}
            onGenerationsChange={(newGene: SearchConditions['generations']) =>
              setCondition((preVal) => ({ ...preVal, generations: newGene }))
            }
          />
        </div>
        {/* 検索ボタン */}
        <SearchButton
          condition={condition}
          onClose={searchModalClose}
          onReset={handleResetForm}
        />
      </section>
    </dialog>
  );
};

export default Search;
