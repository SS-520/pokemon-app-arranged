/* 描画関連の機能 */
import { type RefObject } from 'react';

// 読み込むファイル
import type { LsPokemon } from '../types/typesUtility';
import type { MainModalHandle } from '../types/typesUtility';

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
export const mainContents = (allDisplayData: LsPokemon[], displayNum: number, pageNum: number, modalRef: RefObject<MainModalHandle | null>): React.ReactNode => {
  // 表示開始の配列index（配列は0から開始なので-1する）
  const startNum: number = displayNum * (pageNum - 1);
  // 表示終了のindex（配列は0から開始なので-1する）
  const endNum: number = displayNum * pageNum;

  // ページ移動の時は開始番号を変更
  const displayData = [...allDisplayData].slice(startNum, endNum);
  return displayData.map((pokemon: LsPokemon, index: number) => (
    <div key={index} className='pokemonCard' onClick={() => showDetail(modalRef)}>
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
export const showDetail = (modalRef: RefObject<MainModalHandle | null>) => {
  console.log({ modalRef });
  modalRef.current?.showModal();
};

// ダイアログの外側がクリックされたかを判定して閉じる
export const closeDetail = (event: React.MouseEvent<HTMLDialogElement>, dialogRef: RefObject<HTMLDialogElement | null>) => {
  // クリック先がモーダル上なら何もしない
  if (!dialogRef.current) return;

  // ダイアログ背景をクリックしたら閉じる
  if (event.target === dialogRef.current) {
    dialogRef.current.close();
  }
};
