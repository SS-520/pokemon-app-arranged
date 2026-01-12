/* 描画関連の機能 */

// 読み込むファイル
import type { LsPokemon } from '../types/typesUtility';

// 読み込むコンポーネント
import Card from '../../components/Card';

//
/* 機能 */
//

// メインエリアの表示内容（カード）
/*** @name loadProcess
 *   @function arrow, async/await
 *   @param allDisplayData:LsPokemon[] 表示対象の配列
 *   @param displayNum:number 表示件数
 *   @param pageNum:number ページ番号
 *   @return ReactNode
 */
export const mainContents = (allDisplayData: LsPokemon[], displayNum: number, pageNum: number): React.ReactNode => {
  // 表示開始の配列index（配列は0から開始なので-1する）
  const startNum: number = displayNum * (pageNum - 1);
  // 表示終了のindex（配列は0から開始なので-1する）
  const endNum: number = displayNum * pageNum;

  // ページ移動の時は開始番号を変更
  const displayData = [...allDisplayData].slice(startNum, endNum);
  return displayData.map((pokemon: LsPokemon, index: number) => (
    <div key={index}>
      <Card pokemon={pokemon} />
    </div>
  ));
};
