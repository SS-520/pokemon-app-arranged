/* 描画関連の機能 */
import { type RefObject } from 'react';

// 読み込むファイル
import type { LsPokemon } from '../types/typesUtility';
import type { setSelectPokemon, MainModalHandle } from '../types/typesUtility';

//
/* 機能 */
//

// モーダルの表示
/*** @name showDetail
 *   @function arrow
 *   @param
 *   @return void
 */
export const showDetail = (modalRef: RefObject<MainModalHandle | null>, pokemon?: LsPokemon, setSelectPokemon?: setSelectPokemon) => {
  if (pokemon && setSelectPokemon) {
    // 渡されたポケモンの基礎情報を変数に格納
    setSelectPokemon(pokemon);
  }
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
