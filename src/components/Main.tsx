import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Pagination, Stack } from '@mui/material'; //ページング

// 呼び出し関数・型
import type {
  AbilityData,
  LsPokemon,
  PokedexData,
} from '../utilities/types/typesUtility';
import { showDetail } from '../utilities/function/renderFunction';
import type { MainModalHandle } from '../utilities/types/typesUtility';

// CSS呼び出し
import {} from '../scss/Main.scss';

// 呼び出しコンポーネント
import MainModal from './MainModal';
import Card from './Card';

// props定義
interface MainProps {
  allData: RefObject<LsPokemon[]>;
  displayData: RefObject<LsPokemon[]>;
  pokedexData: RefObject<PokedexData[]>;
  abilityData: RefObject<AbilityData[]>;
  displayNum: number;
  displayType: boolean;
}
function Main({
  allData,
  displayData,
  pokedexData,
  abilityData,
  displayNum,
  displayType,
}: MainProps) {
  /* 各種設定宣言 */

  // URLから取得する情報
  //  ページ番号
  const getPageFromUrl = (): number => {
    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // 負の数や小数点が入ってきたら修正
    const page = parseInt(params.get('page') ?? '1', 10);
    // 確実に1か渡ってきた数値を返す
    return isNaN(page) || page < 1 ? 1 : page;
  };

  // ページ番号設定
  // URLパラメータのpage値があるならそれを設置
  // 最初の一回だけ実行⇒アロー関数でラップ
  const [page, setPage] = useState<number>(() => getPageFromUrl());

  // 総ページ数（派生ステートとして計算）
  const totalPages = Math.ceil((allData.current?.length || 0) / displayNum);

  // モーダル開閉ハンドラ
  const modalRef = useRef<MainModalHandle | null>(null);

  // モーダルに渡すポケモンの基本情報
  const [selectPokemon, setSelectPokemon] = useState<LsPokemon | null>(null);

  /**
   * ページ変更時のハンドラ
   * @param {React.ChangeEvent<unknown>} event
   * @param {number} value 新しいページ番号
   */
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    console.log('start');
    //ページ番号をセット
    setPage(value);

    // 表示URLにページ番号のパラメータ付与
    const url = new URL(window.location.href);
    url.searchParams.set('page', value.toString());
    window.history.pushState({}, '', url);
  };

  //
  /* カード表示部分の中間処理 */
  // 描画処理の最適化のためメモ化する
  const pokemonListContent = useMemo(() => {
    // 表示開始の配列index（配列は0から開始なので-1する）
    const startNum: number = displayNum * (page - 1);
    // 表示終了のindex（配列は0から開始なので-1する）
    const endNum: number = displayNum * page;

    // ページ移動の時は開始番号を変更
    const currentDisplayData = (displayData.current || []).slice(
      startNum,
      endNum,
    );
    return currentDisplayData.map((pokemon: LsPokemon) => (
      <div
        key={pokemon.id}
        className='pokemonCard'
        data-id={pokemon.id}
        onClick={() => showDetail(modalRef, pokemon, setSelectPokemon)}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            showDetail(modalRef, pokemon, setSelectPokemon);
          }
        }}
        aria-label={`${pokemon.name}の詳細を表示`}
      >
        <Card pokemon={pokemon} />
      </div>
    ));
  }, [displayData, page, modalRef, displayNum]);

  //
  /* ページ遷移時の処理 */
  useEffect(() => {
    console.log('useEffect Start');
    // 表示データを最新に更新
    if (allData.current) {
      displayData.current = allData.current;
    }

    // ページが変わった時だけ画面トップに戻す

    document.getElementById('root')?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });

    console.log('useEffect End');
    console.log(`Page changed to: ${page}`);
  }, [page, displayNum, allData, displayData]);

  /* 描画内容 */
  return (
    <React.Fragment>
      <main
        className={`pokemonCardContainer ${displayType ? 'list' : 'grid'}`}
        id='pokemonCardContainer'
      >
        {pokemonListContent}
      </main>
      <div className='btn' id='paging'>
        <Stack className='pagination'>
          {/* count: 総ページ数
              boundaryCount: 最初と最後に表示する数
              siblingCount: 現在のページの左右に表示する数
            */}
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChange}
            color='primary'
            size='medium'
            boundaryCount={1}
            siblingCount={1}
            showFirstButton
            showLastButton
            className='paginationNav'
          />
        </Stack>
      </div>

      {/* selectPokemonがnullかで処理分岐*/}
      {selectPokemon ? (
        <MainModal
          ref={modalRef}
          pokemon={selectPokemon}
          pokedexData={pokedexData}
          abilityData={abilityData}
          allData={allData.current || []}
          onClose={() => setSelectPokemon(null)}
          key={selectPokemon.id}
        />
      ) : (
        <React.Fragment></React.Fragment>
      )}
    </React.Fragment>
  );
}

export default Main;
