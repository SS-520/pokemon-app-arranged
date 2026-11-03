// 検索・リセットボタン

import React from 'react'
import type { LsPokemon } from '../../utilities/types/typesUtility';

import { usePokemonData } from '../../contexts/PokemonDataContext'
import { searchPokemon } from '../../utilities/function/searchPokemonFunction';


// プロップス型定義
interface SearchButtonProps {
  onClose?: () => void; // モーダルを閉じる関数(親コンポーネントで定義済)
  onReset?: () => void; // フォームの選択状態を全初期化する関数
}

// コンポーネント本体
const SearchButton = ({ onClose, onReset }: SearchButtonProps): React.ReactNode => {

  // contextでデータを受け取る
  const { pokemonAllData, setSearchResults } = usePokemonData();

  /* リセットボタン押下処理 */
  const handleResetClick = (): void => {
    // Contextの検索結果をnullに戻す（これにより、App.tsx側で全件表示に切り替わる）
    setSearchResults(null);

    // フォームの入力・選択を初期化する親の関数を実行
    if (onReset) {
      onReset();
    }
  };

  /* 検索ボタン押下処理 */
  const handleSearchClick = (): void => {
    
    // 1. フィルタリング実行
    const results:LsPokemon[] = searchPokemon(pokemonAllData);

    // 2. 結果をcontextに保存・更新
    //  ⇒App.tsxのdisplayPokemonDataが更新される
    setSearchResults(results);

    // 3. モーダルを閉じる（引数で受け取った関数を呼び出し）
    if (onClose) {
      onClose();
    }
  }

  // 描画内容
  return (
    <div className='buttonArea'>
      <button className='resetButton' type='button' onClick={handleResetClick}>全リセット</button>
      <button className='searchButton' type='button' onClick={handleSearchClick}>検索</button>
    </div>
  )
}

export default SearchButton