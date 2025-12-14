/* 各種機能記述ファイル */

/* 設定・導入 */
import type { Result, ResultAsync } from 'neverthrow'; // 非同期処理用ライブラリ
import type { FetchError, PokemonDetailAndURL } from './typesFetch'; // PokemonListResponse型を使用（type{型}）
import type { setBoolean, setURL, setTypePokemonDetailData } from './types-utility';
import { getNowCount, fetchPokemonData } from './fetchPokemon'; // getAllPokemon関数を呼び出し

/***  処理記述 ***/

// 画面初回ロード時に行う処理
/*** @name loadProcess
 *   @function
 *   @param initialURL:string(ポケモンAPI)
 *   @param setPreURL:setURL(前ページURL更新,useState)
 *   @param setNextURL:setURL(次ページURL更新,useState)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param setPokemonDetailData:setTypePokemonDetailData(個々のポケモンデータの配列)
 *   @return void
 * 
  1. fetchで更新があるか確認

  2-1. 更新がない
  2-2. ローカルストレージから表示用のデータを取得
  2-3. 取得したデータを画面に表示

  3-1. 更新がある
  3-2. 最初の50件のデータを取得
  3-3. 表示用データを画面に表示
  3-4. バックグラウンドで残りのデータを50件ずつ取得・格納
*/
export const loadProcess = (initialURL: string, setIsLoading: setBoolean): void => {
  // 1. fetchで更新があるか確認
  firstDataCheck(initialURL);

  // ローディング解除
  setIsLoading(false);
};

// fetchで更新があるか確認
/*** @name loadProcess
 *   @function
 *   @param initialURL:string(ポケモンAPI)
 *   @param setPreURL:setURL(前ページURL更新,useState)
 *   @param setNextURL:setURL(次ページURL更新,useState)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param setPokemonDetailData:setTypePokemonDetailData(個々のポケモンデータの配列)
 *   @return void
 * 
  1. fetchで更新があるか確認
*/
const firstDataCheck = (initialURL: string) => {
  // ポケモンAPIからカウントを取得
  const nowCount: ResultAsync<number, FetchError> = getNowCount(initialURL);
  console.log(nowCount);
};

// ポケモンAPIから情報を取得する非同期処理
/*** @name fetchPokemonData
 *   @function
 *   @param url:string(ポケモンAPI)
 *   @param setPreURL:setURL(前ページURL更新,useState)
 *   @param setNextURL:setURL(次ページURL更新,useState)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param setPokemonDetailData:setTypePokemonDetailData(個々のポケモンデータの配列)
 *   @return Promise<void> :async仕様⇒Promise型
 *  ポケモンAPIからデータを取得・加工する全体処理
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */
export const asynchroFunction = async (url: string, setPreURL: setURL, setNextURL: setURL, setIsLoading: setBoolean, setPokemonDetailData: setTypePokemonDetailData): Promise<void> => {
  // 非同期処理でAPIから情報取得処理を定義

  // fetch処理一式実行
  // エラー含めResult型で結果が戻ってくる
  const resultPokemonData: Result<PokemonDetailAndURL, FetchError> = await fetchPokemonData(url);

  // resultPokemonData:Resultは成功も失敗も内包⇒matchで分岐処理
  resultPokemonData.match(
    // 成功：変数pokemonData
    (resPokemonData) => {
      // 前ページ情報取得URLを格納
      setPreURL(resPokemonData.previous);

      // 次ページ情報取得URLを格納
      setNextURL(resPokemonData.next);

      // 結果をpokemonDetailDataに格納（更新）
      setPokemonDetailData(resPokemonData.pokemonDetailData);
    },
    // 失敗：変数fetchError
    (fetchError) => {
      // FetchError を処理
      console.error(`[データ取得失敗] エラータイプ: ${fetchError.type}`, fetchError);
    },
  );

  // 画面をトップにスクロールして戻す
  window.scroll({ top: 0 });

  // ローディング解除
  setIsLoading(false);
};

// ページ遷移処理
/*** @name movePage
 *   @function:void（戻り値無）
 *   @param url:string(ポケモンAPI)
 *   @param setPreURL:setURL(前ページURL更新,useState)
 *   @param setNextURL:setURL(次ページURL更新,useState)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param setPokemonDetailData:setTypePokemonDetailData(個々のポケモンデータの配列)
 *   @return void
 *  前後のページに遷移・該当ページに表示するポケモン情報を取得／表示する
 *  処理が同じなのでブラウザ表示時のasynchroFunction()を使用する
 */

export const movePage = (url: string, setPreURL: setURL, setNextURL: setURL, setIsLoading: setBoolean, setPokemonDetailData: setTypePokemonDetailData): void => {
  // ロード中にする
  setIsLoading(true);

  // 指定URLでAPIを実行し内容を表示する
  asynchroFunction(url, setPreURL, setNextURL, setIsLoading, setPokemonDetailData);
};
