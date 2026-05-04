// import React from 'react';
import type React from 'react';
import type { ViewSettings } from '../utilities/types/typesUtility';
import { storageAvailable } from '../utilities/function/utilityFunction';
import logo from '../img/title.png';

// アイコン
import { FaSearch } from 'react-icons/fa';
import { MdGridView } from 'react-icons/md';
import { FaList } from 'react-icons/fa6';
import { TbRefresh } from 'react-icons/tb';

// スタイル
import '../scss/NavigationBar.scss';

// プロップスの型定義
interface NavigationBarProps {
  viewSettings: ViewSettings;
  updateViewSettings: (newVal: Partial<ViewSettings>) => void;
  isBgLoading: boolean;
}
function NavigationBar({
  viewSettings,
  updateViewSettings,
  isBgLoading,
}: NavigationBarProps) {
  // ローカルストレージの使用可否
  const isLsAvailable = storageAvailable('localStorage');

  // 表示件数変更時のハンドラ
  const handleChangeDisplayNum = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const displayNumValue = event.target.value;
    // 変更がない場合は処理を中断
    if (displayNumValue === viewSettings.displayNum.toString()) return;
    updateViewSettings({ displayNum: Number(displayNumValue) }); // 更新関数に対象のみ詰める

    // 表示URLにページ番号のパラメータ付与
    const url = new URL(window.location.href);
    url.searchParams.set('Num', displayNumValue);
    window.history.pushState({}, '', url);
  };

  // 表示形式変更時のハンドラ
  // booleanを反転させる
  const handleChangeDisplayType = (): void => {
    const nextDisplayType = !viewSettings.displayType;
    updateViewSettings({ displayType: nextDisplayType }); // 更新関数に対象のみ詰める

    // 表示URLに表示タイプのパラメータ付与
    // false(0): grid, true(1): list
    const url = new URL(window.location.href);
    url.searchParams.set('Type', nextDisplayType ? '1' : '0');
    window.history.pushState({}, '', url);
  };

  // リフレッシュ時のハンドラ
  const handleChangeRefresh = (): void => {
    if (
      confirm(
        '全データを再取得します。\n通信環境によっては時間がかかる可能性があります。\n再取得しますか？\n\n※画面を再読み込みします',
      )
    ) {
      // OKを押下
      localStorage.clear(); // 一回全部クリア
      localStorage.setItem('confirm', 'true'); // 注意事項の確認フラグは元に戻す

      // 画面をパラメータなしの初期URLで再読み込み（履歴も上書き）
      const domainName: string = window.location.origin; // プロトコル＋ドメイン
      const domainPathName: string = window.location.pathname; // パス名（パラメータを初期化）
      window.location.replace(domainName + domainPathName);
    }
  };

  // 検索ハンドラ
  const handleChangeSearch = (event: React.MouseEvent): void => {
    // isBgLoadingがtrueの場合は処理を中断
    if (isBgLoading) {
      console.log('handleChangeSearch');
      event.preventDefault(); // ブラウザの標準の動きを止める
      alert('バックグラウンドで全データ取得完了後に\n検索可能です');
      return; // 早期に処理を中断
    }
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
      {isLsAvailable ? (
        <button
          className='refreshIcon icon'
          type='button'
          aria-label='再読み込み'
          onClick={handleChangeRefresh}
        >
          <span className='iconImage'>
            <TbRefresh />
          </span>
          <span className='iconText'>data</span>
        </button>
      ) : (
        <></>
      )}
      <button
        className='changeDisplayIcon icon'
        onClick={handleChangeDisplayType}
        type='button'
        aria-label='表示形式切り替え'
      >
        <span className='iconImage'>
          {viewSettings.displayType ? <FaList /> : <MdGridView />}
        </span>
        <span className='iconText'>view</span>
      </button>
      <button
        className={`searchIcon icon ${isBgLoading ? 'disabled' : ''}`}
        aria-disabled={isBgLoading} // バックグラウンドでデータ取得中の場合はクリック不可
        aria-label='検索'
        type='button'
        onClick={handleChangeSearch}
      >
        <span className='iconImage'>
          <FaSearch />
        </span>
        <span className='iconText'>search</span>
      </button>
      <div className='showItemsNumber'>
        <label htmlFor='showNum'>表示件数</label>
        <select
          name='showNum'
          id='showNum'
          size={1}
          value={viewSettings.displayNum}
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
