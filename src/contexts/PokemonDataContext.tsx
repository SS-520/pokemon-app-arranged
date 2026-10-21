// ポケモンデータ伝達用のcontext
// appから各コンポーネントへ、検索結果を渡すために使用

import React, { createContext, useContext } from 'react'
import type { AbilityData, LsPokemon, PokedexData } from '../utilities/types/typesUtility'

// ファイル内で使用する型定義
interface PokemonDataContextType  {
  pokemonAllData: LsPokemon[];
  pokedexData: PokedexData[];
  abilityData: AbilityData[];
  pokemonMap: Map<number, LsPokemon>;
}

// 1. contextの初期値（入れ物）設定
//  初期値：undefined（安全策のため）
const PokemonDataContext: React.Context<PokemonDataContextType | undefined> = createContext<PokemonDataContextType | undefined>(undefined);


// 2. 下層にデータを届けるプロバイダーコンポーネント
// 
// 型定義
interface PokemonDataProviderProps {
  children: React.ReactNode;
  value: PokemonDataContextType;  
}

// プロバイダー本体
export const PokemonDataProvider = ({children,value}: PokemonDataProviderProps) => {
  return (
    <PokemonDataContext.Provider value={value}>
      {children}
    </PokemonDataContext.Provider>
  )
}


// 3. 子コンポーネントからデータを取り出すカスタムフック
// 使用する側：useEffectなどで参照したいcomponent
// eslint-disable-next-line react-refresh/only-export-components
export const usePokemonData = (): PokemonDataContextType => {
  const context = useContext(PokemonDataContext);

  // プロバイダーのあhん以外で使用⇒エラー出す
  //  ※ここでエラー対応をすることで、後続の処理で「データがない可能性」を排除可能
  if (!context) {
    throw new Error('usePokemonData must be used within a PokemonDataProvider(usePokemonDataはPokemonDataProviderの中で使用）');
  }
  return context;
}
