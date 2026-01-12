/* 描画関連の機能 */

// 読み込むファイル
import type { LsPokemon } from '../types/typesUtility';

// 読み込むコンポーネント
import Card from '../../components/Card';

//
/* 機能 */
//

// メインエリアの表示内容（カード）
export const mainContents = (pokemonAllData: LsPokemon[], displayStartNum: number, displayNum: number): React.ReactNode => {
  const displayData = [...pokemonAllData].slice(displayStartNum, displayNum);
  return displayData.map((pokemon: LsPokemon) => (
    <div>
      <Card pokemon={pokemon} />
    </div>
  ));
};
