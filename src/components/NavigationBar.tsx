// import React from 'react';
import '../scss/NavigationBar.scss';
import type { setBoolean, setNumber } from '../utilities/types/typesUtility';
import logo from '../img/title.png';

// アイコン
import { FaSearch } from 'react-icons/fa';
import { MdGridView } from 'react-icons/md';
import { FaList } from 'react-icons/fa6';

// プロップスの型定義
interface NavigationBarProps {
  setDisplayNum: setNumber;
  displayNum: number;
  setDisplayType: setBoolean;
  displayType: boolean;
}
function NavigationBar({
  setDisplayNum,
  displayNum,
  setDisplayType,
  displayType,
}: NavigationBarProps) {
  // 表示件数変更時のハンドラ
  const handleChangeDisplayNum = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const displayNumValue = event.target.value;
    // 変更がない場合は処理を中断
    if (displayNumValue === displayNum.toString()) return;
    setDisplayNum(Number(displayNumValue));

    // 表示URLにページ番号のパラメータ付与
    const url = new URL(window.location.href);
    url.searchParams.set('Num', displayNumValue);
    window.history.pushState({}, '', url);
  };

  // 表示形式変更時のハンドラ
  // booleanを反転させる
  const handleChangeDisplayType = (): void => {
    const nextDisplayType = !displayType;
    setDisplayType(nextDisplayType);

    // 表示URLに表示タイプのパラメータ付与
    // false(0): grid, true(1): list
    const url = new URL(window.location.href);
    url.searchParams.set('Type', nextDisplayType ? '1' : '0');
    window.history.pushState({}, '', url);
  };

  /* レンダリング結果 */
  return (
    <div className='navArea'>
      <header id='navigation'>
        <h1>
          <img className='titleLogo' src={logo} alt='読む！' />
          ポケモン図鑑
        </h1>
      </header>
      <button
        className='changeDisplayIcon icon'
        onClick={handleChangeDisplayType}
        type='button'
        aria-label='表示形式切り替え'
      >
        <span className='iconImage'>
          {displayType ? <FaList /> : <MdGridView />}
        </span>
        <span className='iconText'>view</span>
      </button>
      <div className='searchIcon icon'>
        <span className='iconImage'>
          <FaSearch />
        </span>
        <span className='iconText'>search</span>
      </div>
      <div className='showItemsNumber'>
        <label htmlFor='showNum'>表示件数</label>
        <select
          name='showNum'
          id='showNum'
          size={1}
          value={displayNum}
          onChange={handleChangeDisplayNum}
        >
          <option value='30'>30件</option>
          <option value='60'>60件</option>
          <option value='90'>90件</option>
          <option value='120'>120件</option>
        </select>
      </div>
    </div>
  );
}

export default NavigationBar;
