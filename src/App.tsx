// 基本設定と拡張機能
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// 外部の関数・型定義ファイル
import type {
  AbilityData,
  LsPokemon,
  PokedexData,
} from './utilities/types/typesUtility';
import { loadPokemonProcess } from './utilities/function/loadPokemonFunction';
import { loadPokedexProcess } from './utilities/function/loadPokedexFunction';
import { loadAbilityProcess } from './utilities/function/loadAbilityFunction';

import './scss/App.scss'; // viteがコンパイル時にcssに自動で処理するので、importはscssでOK

// 読み込むコンポーネント
import NavigationBar from './components/NavigationBar';
import Loading from './components/Loading';
import Contents from './components/Contents';

// コンポーネントメイン記述
function App() {
  /** ローディング判定 **/

  // バックグラウンドでデータ取得中かの判定
  const isBgLoading = useRef<boolean>(true);

  /** 画面表示 **/

  // URLから取得する情報（表示件数）
  const getDisplayNumFromUrl = (): number => {
    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // 負の数や小数点が入ってきたら修正
    const displayNum = parseInt(params.get('Num') ?? '30', 10); // 10は10進数として処理⇒小数点なども整数に直す
    // 確実に1か渡ってきた数値を返す
    return isNaN(displayNum) || displayNum < 1 ? 1 : displayNum;
  };

  // 表示開始index番号
  // 表示件数（初期値：30匹）
  // 最初の一回だけ実行⇒アロー関数でラップ
  const [displayNum, setDisplayNum] = useState<number>(() =>
    getDisplayNumFromUrl(),
  );

  // URLから取得する情報（表示形式）
  const getDisplayTypeFromUrl = (): boolean => {
    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // 負の数や小数点が入ってきたら修正
    const displayType: number = parseInt(params.get('Type') ?? '0', 10); // 10は10進数として処理⇒小数点なども整数に直す
    // false: grid, true: list
    // 'true'で渡ってきたとき以外は全てfalse扱いになる
    return Boolean(displayType);
  };

  // 表示形式
  // 最初の一回だけ実行⇒アロー関数でラップ
  const [displayType, setDisplayType] = useState<boolean>(() =>
    getDisplayTypeFromUrl(),
  ); // false: grid, true: list

  // 画面に表示するポケモンデータ
  const queryClient = useQueryClient();

  //
  //
  ///* fetchでポケモンデータを取得 *///

  /* ポケモンデータ編 */
  // useQueryの結果を分割代入で受け取る
  const {
    // returnされたデータ（名前をuseStateの時と同じにすることで利用のリライトを防止）
    // []で初期値を設定することで、undefinedを回避
    data: pokemonAllData = [],
    // loadPokemonProcessを実行中か判定するフラグ
    // 実行中はtrue、終了後はfalse
    isLoading: isMainLoading, // 既存名と名前を分けて衝突を避ける
    isError: isMainError, // loadPokemonProcess内でthwrowがあったらtrueになるフラグ
    error: mainError, // loadPokemonProcess内でthwrowされたエラーの箱
  } = useQuery<LsPokemon[]>({
    queryKey: ['pokemon', 'all'], // unknown型配列
    queryFn: ({ signal }) =>
      loadPokemonProcess(queryClient, isBgLoading, signal), // promiseを返す関数を設定
    staleTime: Infinity,
  });

  // 一旦画面描画後にエラー処理
  useEffect(() => {
    if (isMainError) {
      console.error(mainError);
      alert('情報取得中にエラーが発生しました。\n再読み込みを試みます。');
      window.location.reload();
    }
  }, [isMainError, mainError]);

  /* Pokedex編 */
  const {
    // returnされたデータ（名前をuseStateの時と同じにすることで利用のリライトを防止）
    // []で初期値を設定することで、undefinedを回避
    data: pokedexData = [],
    // loadPokemonProcessを実行中か判定するフラグ
    // 実行中はtrue、終了後はfalse
    isLoading: isPokedexLoading, // 既存名と名前を分けて衝突を避ける
    isError: isPokedexError, // loadPokemonProcess内でthwrowがあったらtrueになるフラグ
    error: pokedexError, // loadPokemonProcess内でthwrowされたエラーの箱
    refetch: refetchPokedex, // 再取得用関数
  } = useQuery<PokedexData[]>({
    queryKey: ['pokedex', 'all'], // unknown型配列
    queryFn: ({ signal }) => loadPokedexProcess(signal), // promiseを返す関数を設定
    staleTime: Infinity,
  });

  // 一旦画面描画後にエラー処理
  useEffect(() => {
    if (isPokedexError) {
      console.error(pokedexError);
      refetchPokedex(); // エラー発生時に自動で再取得
    }
  }, [isPokedexError, pokedexError, refetchPokedex]);

  /* 特性編 */
  const {
    // returnされたデータ（名前をuseStateの時と同じにすることで利用のリライトを防止）
    // []で初期値を設定することで、undefinedを回避
    data: abilityData = [],
    // loadPokemonProcessを実行中か判定するフラグ
    // 実行中はtrue、終了後はfalse
    isLoading: isAbilityLoading, // 既存名と名前を分けて衝突を避ける
    isError: isAbilityError, // loadPokemonProcess内でthwrowがあったらtrueになるフラグ
    error: abilityError, // loadPokemonProcess内でthwrowされたエラーの箱
    refetch: refetchAbility, // 再取得用関数
  } = useQuery<AbilityData[]>({
    queryKey: ['ability', 'all'], // unknown型配列
    queryFn: ({ signal }) => loadAbilityProcess(signal), // promiseを返す関数を設定
    staleTime: Infinity,
  });

  // 一旦画面描画後にエラー処理
  useEffect(() => {
    if (isAbilityError) {
      console.error(abilityError);
      refetchAbility(); // エラー発生時に自動で再取得
    }
  }, [isAbilityError, abilityError, refetchAbility]);

  // 表示カードを作成
  console.log({ abilityData });
  return (
    <React.Fragment>
      <NavigationBar
        setDisplayNum={setDisplayNum}
        displayNum={displayNum}
        setDisplayType={setDisplayType}
        displayType={displayType}
      />
      <div className='App'>
        {
          // 変数loadingの状態で画面の表示を変更⇒短いのでifを使用せず３項演算子で済ませる
          // 条件文 ? trueの処理 : falseの処理
          // すべてのロードが終わったら表示
          isMainLoading || isPokedexLoading || isAbilityLoading ? (
            <Loading />
          ) : (
            <Contents
              allData={pokemonAllData}
              pokedexData={pokedexData}
              abilityData={abilityData}
              displayNum={displayNum}
              displayType={displayType}
            />
          )
        }
      </div>
    </React.Fragment>
  );
}

export default App;
