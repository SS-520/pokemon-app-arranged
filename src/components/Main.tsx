import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Pagination, Stack } from '@mui/material'; //ページング

// 呼び出し関数
import type { LsPokemon } from '../utilities/types/typesUtility';
import { mainContents } from '../utilities/function/renderFunction';

// CSS呼び出し
import {} from '../scss/Main.scss';

// props定義
interface MainProps {
  allData: RefObject<LsPokemon[]>;
  displayData: RefObject<LsPokemon[]>;
}
function Main({ allData, displayData }: MainProps) {
  /* 各種設定宣言 */

  displayData.current = allData.current;
  const allDisplayData = useRef<number>(displayData.current.length); //全件数

  // 表示開始index番号
  // 表示件数（初期値：20匹）
  const [displayNum, setDisplayNum] = useState<number>(20);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(allDisplayData.current / displayNum));

  /**
   * ページ変更時のハンドラ
   * @param {React.ChangeEvent<unknown>} event
   * @param {number} value 新しいページ番号
   */
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number): void => {
    //ページ番号をセット
    setPage(value);
    // 表示データを最新に更新
    displayData.current = allData.current;
    // 最大件数を最新に更新
    setTotalPages(Math.ceil(displayData.current.length / displayNum));

    // ページ遷移に伴う表示内容変更
    mainContents(displayData.current, displayNum, page);
    // 画面トップに戻す
    document.getElementById('root')?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });
    console.log(`Page changed to: ${value}`);
  };

  return (
    <>
      <div className='pokemonCardContainer' id='pokemonCardContainer'>
        {mainContents(displayData.current, displayNum, page)}
      </div>
      <div className='btn' id='paging'>
        <Stack className='pagination'>
          {/* count: 総ページ数
              boundaryCount: 最初と最後に表示する数
              siblingCount: 現在のページの左右に表示する数
            */}
          <Pagination count={totalPages} page={page} onChange={handleChange} color='primary' size='medium' boundaryCount={1} siblingCount={1} showFirstButton showLastButton className='paginationNav' />
        </Stack>
      </div>
    </>
  );
}

export default Main;
