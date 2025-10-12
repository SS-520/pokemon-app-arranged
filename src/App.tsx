import { useEffect, useState } from 'react';
import './App.scss';
import type { PokemonListResponse, PokemonDetail } from './utilities/types'; // PokemonListResponse型を使用（type{型}）
import { getAllPokemon, loadPokemon } from './utilities/pokemon'; // getAllPokemon関数を呼び出し

function App() {
  // 土台になるポケモンAPIのURLを指定
  const initialURL: string = 'https://pokeapi.co/api/v2/pokemon';

  // ローディング画面設定
  // 画面の状態管理のためuseStateを使用
  // ロード中/ロード済の二択なのでbooleanで版担
  // 初期値⇒リロード＝ローディング中＝true
  const [loading, setLoading] = useState<boolean>(true);

  // 各ポケモンの詳細情報を格納（useEffect外で使用）
  const [pokemonDetailData, setPokemonDetailData] = useState<PokemonDetail[]>([]);

  // ブラウザロード時実行
  // 一度だけ実行⇒第二引数は[]で空配列
  useEffect(() => {
    // 非同期処理でAPIから情報取得処理を定義
    const fetchPokemonData = async (): Promise<void> => {
      try {
        // 失敗の可能性がある処理（awaitで呼び出す関数）

        // 全ポケデータを取得
        // getAllPokemon()の処理が終わるまで待機してからresPokemonに格納
        const resPokemon: PokemonListResponse = await getAllPokemon(initialURL); // src/utilities/pokemon.tsxの関数にAPIのUPLを渡す
        // console.log(resPokemon); // 結果を出力

        // 各ポケモンの詳細なデータを取得
        // loadPokemon()の処理が終わるまで待ち、全データの中のresults配列を引数で渡す
        // awaitで配列状態になってから渡ってくる⇒Promise<PokemonDetail[]>ではなく、PokemonDetail[]の配列型でOK
        const resLoadPokemon: PokemonDetail[] = await loadPokemon(resPokemon.results);

        // resLoadPokemonをfetchPokemonDataのスコープ外で使用するので、PokemonDetailDataに格納
        setPokemonDetailData(resLoadPokemon);
      } catch (error) {
        // awaitの処理が失敗（reject）されたらこっちに入る(引数：error)
        console.error('fetchPokemonData()においてデータ取得中にエラーが発生しました:', error);
      }
      // 全部終わったらローディング完了のため変数loadingをfalseに変更
      setLoading(false);
    };

    // fetch処理一式実行
    fetchPokemonData();
  }, []);

  // 変数loadingの状態で画面の表示を変更⇒短いのでifを使用せず３項演算子で済ませる
  // 条件文 ? trueの処理 : falseの処理
  return (
    <div className='App'>
      {loading ? (
        <h1>Now Loading</h1>
      ) : (
        /* ロード完了後のメイン処理 */
        <div className='pokemonCardcontainer'>
          {/* {pokemonDetailData.map((pokemon: PokemonDetail, i: number) => {
            // 配列pokemonDetailDataの各データをpokemonをする
            // i = index(0~19)
            return <div>Pokemon</div>;
          })} */}
        </div>
      )}
    </div>
  );
}

export default App;
