// 基本設定と拡張機能
import { useEffect, useState } from 'react';

// 外部の関数・型定義ファイル
import type { PokemonListResponse, PokemonDetail } from './utilities/types'; // PokemonListResponse型を使用（type{型}）
import { asynchroFunction, movePage } from './utilities/function'; // getAllPokemon関数を呼び出し
import './scss/App.scss'; // viteがコンパイル時にcssに自動で処理するので、importはscssでOK

// 読み込むコンポーネント
import Card from './components/Card';
import NavigationBar from './components/NavigationBar';

function App() {
  // 土台になるポケモンAPIのURLを指定
  const initialURL: string = 'https://pokeapi.co/api/v2/pokemon';

  // 前ページ分のデータを取得するためのURL
  //    型は元定義の「PokemonListResponse」から取得
  const [preURL, setPreURL] = useState<PokemonListResponse['previous']>(null);

  // 次ページ分のデータを取得するためのURL
  //    型は元定義の「PokemonListResponse」から取得
  const [nextURL, setNextURL] = useState<PokemonListResponse['next']>(null);

  // ローディング画面設定
  // 画面の状態管理のためuseStateを使用
  // ロード中/ロード済の二択なのでbooleanで判断
  // 初期値⇒リロード＝ローディング中＝true
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 各ポケモンの詳細情報を格納（useEffect外で使用）
  const [pokemonDetailData, setPokemonDetailData] = useState<PokemonDetail[]>([]);

  // ブラウザロード時実行
  // 一度だけ実行⇒第二引数は[]で空配列
  useEffect(() => {
    // 非同期処理実行
    asynchroFunction(initialURL, setPreURL, setNextURL, setIsLoading, setPokemonDetailData);
  }, []);

  // 変数loadingの状態で画面の表示を変更⇒短いのでifを使用せず３項演算子で済ませる
  // 条件文 ? trueの処理 : falseの処理
  return (
    <>
      <NavigationBar />
      <div className='App'>
        {isLoading ? (
          <h1>Now Loading</h1>
        ) : (
          /* ロード完了後のメイン処理 */
          <div className='pokemonCardContainer'>
            {pokemonDetailData.map((pokemon: PokemonDetail, i: number) => {
              // 配列pokemonDetailDataの各データをpokemonをする
              // i = index(0~19)
              // Cardコンポーネントを呼び出す
              // key:配列ループのindex
              // props名：pokemon(引数pokemonを渡す)
              return <Card key={i} pokemon={pokemon} />;
            })}
          </div>
        )}
        <div className='btn'>
          {preURL !== null ? <button onClick={() => movePage(preURL, setPreURL, setNextURL, setIsLoading, setPokemonDetailData)}>前へ</button> : <></>}
          {nextURL !== null ? <button onClick={() => movePage(nextURL, setPreURL, setNextURL, setIsLoading, setPokemonDetailData)}>次へ</button> : <></>}
        </div>
      </div>
    </>
  );
}

export default App;
