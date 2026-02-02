import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Pagination, Stack } from '@mui/material'; //ページング

// 呼び出し関数・型
import type { AbilityData, LsPokemon, PokedexData, setBoolean } from '../utilities/types/typesUtility';
import { mainContents } from '../utilities/function/renderFunction';
import type { MainModalHandle } from '../utilities/types/typesUtility';

// CSS呼び出し
import {} from '../scss/Main.scss';

// 呼び出しコンポーネント
import MainModal from './MainModal';

// props定義
interface MainProps {
  allData: RefObject<LsPokemon[]>;
  displayData: RefObject<LsPokemon[]>;
  pokedexData: RefObject<PokedexData[]>;
  abilityData: RefObject<AbilityData[]>;
  setIsLoading: setBoolean;
}
function Main({ allData, displayData, pokedexData, abilityData, setIsLoading }: MainProps) {
  /* 各種設定宣言 */

  displayData.current = allData.current;
  const allDisplayData = useRef<number>(displayData.current.length); //全件数

  // 表示開始index番号
  // 表示件数（初期値：20匹）
  const [displayNum, setDisplayNum] = useState<number>(100);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(allDisplayData.current / displayNum));

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
    //ページ番号をセット
    setPage(value);
    // 表示データを最新に更新
    if (allData.current) {
      displayData.current = allData.current;
      // 最大件数を最新に更新
      setTotalPages(Math.ceil(displayData.current.length / displayNum));
    }

    // ページ遷移に伴う表示内容変更
    mainContents(displayData.current, displayNum, page, modalRef, setSelectPokemon);
    // 画面トップに戻す
    document.getElementById('root')?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });
    console.log(`Page changed to: ${value}`);
  };

  return (
    <>
      <main className='pokemonCardContainer' id='pokemonCardContainer'>
        {mainContents(displayData.current, displayNum, page, modalRef, setSelectPokemon)}
      </main>
      <div className='btn' id='paging'>
        <Stack className='pagination'>
          {/* count: 総ページ数
              boundaryCount: 最初と最後に表示する数
              siblingCount: 現在のページの左右に表示する数
            */}
          <Pagination count={totalPages} page={page} onChange={handleChange} color='primary' size='medium' boundaryCount={1} siblingCount={1} showFirstButton showLastButton className='paginationNav' />
        </Stack>
      </div>
      {/* selectPokemonがnullかで処理分岐*/ selectPokemon ? <MainModal ref={modalRef} pokemon={selectPokemon} pokedexData={pokedexData} abilityData={abilityData} allData={allData.current} /> : <></>}
    </>
  );
}

export default Main;
