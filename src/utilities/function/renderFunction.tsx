/* 描画関連の機能 */
import { type RefObject } from 'react';

// 読み込むファイル
import type { LsPokemon } from '../types/typesUtility';
import type { setSelectPokemon, MainModalHandle } from '../types/typesUtility';

// 読み込むコンポーネント
import Card from '../../components/Card';

//
/* 機能 */
//

// メインエリアの表示内容（カード）
/*** @name loadProcess
 *   @function arrow
 *   @param allDisplayData:LsPokemon[] 表示対象の配列
 *   @param displayNum:number 表示件数
 *   @param pageNum:number ページ番号
 *   @return ReactNode
 */
export const mainContents = (allDisplayData: LsPokemon[], displayNum: number, pageNum: number, modalRef: RefObject<MainModalHandle | null>, setSelectPokemon: setSelectPokemon): React.ReactNode => {
  // 表示開始の配列index（配列は0から開始なので-1する）
  const startNum: number = displayNum * (pageNum - 1);
  // 表示終了のindex（配列は0から開始なので-1する）
  const endNum: number = displayNum * pageNum;

  // ページ移動の時は開始番号を変更
  const displayData = [...allDisplayData].slice(startNum, endNum);
  return displayData.map((pokemon: LsPokemon, index: number) => (
    <div key={index} className='pokemonCard' data-id={pokemon.id} onClick={() => showDetail(modalRef, pokemon, setSelectPokemon)}>
      <Card pokemon={pokemon} />
    </div>
  ));
};

// モーダルの表示
/*** @name showDetail
 *   @function arrow
 *   @param
 *   @return void
 */
export const showDetail = (modalRef: RefObject<MainModalHandle | null>, pokemon?: LsPokemon, setSelectPokemon?: setSelectPokemon) => {
  console.log(pokemon);
  if (pokemon && setSelectPokemon) {
    // 渡されたポケモンの基礎情報を変数に格納
    setSelectPokemon(pokemon);
  }

  console.log(pokemon);

  // モーダルを開く
  modalRef.current?.showModal();
};

// ダイアログの外側がクリックされたかを判定して閉じる
export const closeDetail = (event: React.MouseEvent<HTMLDialogElement>, dialogRef: RefObject<HTMLDialogElement | null>) => {
  // クリック先がモーダル上なら何もしない
  if (!dialogRef.current) return;

  // ダイアログ（コンテンツ部分）の矩形情報を取得
  const rectModalArea = dialogRef.current.getBoundingClientRect();

  // クリックされた座標が矩形の外側（背景部分）にあるか判定
  const isInDialog = rectModalArea.top <= event.clientY && event.clientY <= rectModalArea.top + rectModalArea.height && rectModalArea.left <= event.clientX && event.clientX <= rectModalArea.left + rectModalArea.width;

  // ダイアログの外側（背景部分）をクリックした場合のみ閉じる
  if (!isInDialog) {
    dialogRef.current.close();
  }
};
