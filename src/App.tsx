// 基本設定と拡張機能
import { useEffect, useRef, useState } from 'react';

// 外部の関数・型定義ファイル
import type { LsPokemon } from './utilities/types/typesUtility';
import { loadProcess } from './utilities/function/loadFunction';
import { mainContents } from './utilities/function/renderFunction';
import './scss/App.scss'; // viteがコンパイル時にcssに自動で処理するので、importはscssでOK

// 読み込むコンポーネント

import NavigationBar from './components/NavigationBar';
import Loading from './components/Loading';

function App() {
  // 土台になるポケモンAPIのURLを指定
  const initialURL: string = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

  // 前ページ分のデータを取得するためのURL
  //    型は元定義の「PokemonListResponse」から取得
  // const [preURL, setPreURL] = useState<PokemonListResponse['previous']>(null);

  // 次ページ分のデータを取得するためのURL
  //    型は元定義の「PokemonListResponse」から取得
  // const [nextURL, setNextURL] = useState<PokemonListResponse['next']>(null);

  /** ローディング判定 **/

  // 画面の状態管理のためuseStateを使用
  // ロード中/ロード済の二択なのでbooleanで判断
  // 初期値⇒リロード＝ローディング中＝true
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // バックグラウンドでデータ取得中かの判定
  const isBgLoading = useRef<boolean>(true);

  /** 画面表示 **/

  // 検索・表示に使用する全ポケモンデータを格納
  const pokemonAllData = useRef<LsPokemon[]>([]);

  // 画面に表示するポケモンデータ

  // 表示開始番号
  const [displayStartNum, setDisplayStartNum] = useState<number>(0);
  // 表示件数（初期値：20匹）
  const [displayNum, setDisplayNum] = useState<number>(20);

  // ブラウザロード時実行
  // 一度だけ実行⇒第二引数は[]で空配列
  useEffect(() => {
    const controller = new AbortController();
    // 非同期処理実行
    loadProcess(initialURL, pokemonAllData, setIsLoading, isBgLoading, controller.signal);

    return () => {
      // 1回目の実行（マウント）直後に呼ばれるため、リクエストをキャンセルする
      controller.abort();
    };
  }, []);

  // 表示カードを作成

  // 変数loadingの状態で画面の表示を変更⇒短いのでifを使用せず３項演算子で済ませる
  // 条件文 ? trueの処理 : falseの処理
  return (
    <>
      <NavigationBar />
      <div className='App'>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className='pokemonCardContainer'>{mainContents(pokemonAllData.current, displayStartNum, displayNum)}</div>
            <div className='btn'>
              <button>Prev</button>
              <button>Next</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
