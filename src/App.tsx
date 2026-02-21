// 基本設定と拡張機能
import React, { useEffect, useRef, useState } from 'react';

// 外部の関数・型定義ファイル
import type { AbilityData, LsPokemon, PokedexData } from './utilities/types/typesUtility';
import { loadPokemonProcess } from './utilities/function/loadPokemonFunction';
import { loadOtherInfoProcess } from './utilities/function/loadInfoFunction';

import './scss/App.scss'; // viteがコンパイル時にcssに自動で処理するので、importはscssでOK

// 読み込むコンポーネント
import NavigationBar from './components/NavigationBar';
import Loading from './components/Loading';
import Main from './components/Main';

// コンポーネントメイン記述
function App() {
  // 土台になるポケモンAPIのURLを指定
  const initialURL: string = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

  /** ローディング判定 **/

  // 画面の状態管理のためuseStateを使用
  // ロード中orロード済の二択なのでbooleanで判断
  // 初期値⇒リロード＝ローディング中＝true
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // バックグラウンドでデータ取得中かの判定
  const isBgLoading = useRef<boolean>(true);

  // バックグラウンドで地方関連データ取得中かの判定
  const isOILoading = useRef<boolean>(true);

  /** 画面表示 **/

  // 検索・表示に使用する全ポケモンデータを格納
  const pokemonAllData = useRef<LsPokemon[]>([]);
  const pokemonDisplayData = useRef<LsPokemon[]>([]);

  const pokedexData = useRef<PokedexData[]>([]); // 図鑑・バージョン情報
  const abilityData = useRef<AbilityData[]>([]); // 特性情報

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
  const [displayNum, setDisplayNum] = useState<number>(getDisplayNumFromUrl());

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
  const [displayType, setDisplayType] = useState<boolean>(getDisplayTypeFromUrl()); // false: grid, true: list

  // 画面に表示するポケモンデータ

  // ブラウザロード時実行
  // 一度だけ実行⇒第二引数は[]で空配列
  useEffect(() => {
    // 非同期処理実行
    const controller = new AbortController();

    // メインのポケモン一覧取得
    loadPokemonProcess(initialURL, pokemonAllData, setIsLoading, isBgLoading, controller.signal);

    // 地方・バージョンデータ取得
    loadOtherInfoProcess(pokedexData, abilityData, isOILoading, controller.signal);

    return () => {
      // 1回目の実行（マウント）直後に呼ばれるため、リクエストをキャンセルする
      controller.abort();
    };
  }, []);

  // 表示カードを作成
  console.log({ abilityData });
  return (
    <React.Fragment>
      <NavigationBar setDisplayNum={setDisplayNum} displayNum={displayNum} setDisplayType={setDisplayType} displayType={displayType} />
      <div className="App">
        {
          // 変数loadingの状態で画面の表示を変更⇒短いのでifを使用せず３項演算子で済ませる
          // 条件文 ? trueの処理 : falseの処理
          isLoading ? <Loading /> : <Main allData={pokemonAllData} displayData={pokemonDisplayData} pokedexData={pokedexData} abilityData={abilityData} displayNum={displayNum} displayType={displayType} />
        }
      </div>
    </React.Fragment>
  );
}

export default App;
