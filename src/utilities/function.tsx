/* 各種機能記述ファイル */

/* 設定・導入 */
import type { Result } from 'neverthrow'; // 非同期処理用ライブラリ
import type { FetchError, PokemonDetailAndURL, setURL, setBoolean, setTypePokemonDetailData } from './types'; // PokemonListResponse型を使用（type{型}）
import { fetchPokemonData } from './fetchPokemon'; // getAllPokemon関数を呼び出し

/***  処理記述 ***/

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

  // ローディング解除
  setIsLoading(false);
};

// ページ遷移処理
/*** @name movePage
 *   @function
 *   @param url:string(ポケモンAPI)
 *   @param setPreURL:setURL(前ページURL更新,useState)
 *   @param setNextURL:setURL(次ページURL更新,useState)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param setPokemonDetailData:setTypePokemonDetailData(個々のポケモンデータの配列)
 *   @return void
 *  ポケモンAPIからデータを取得・加工する全体処理
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */

export const movePage = (url: string, setPreURL: setURL, setNextURL: setURL, setIsLoading: setBoolean, setPokemonDetailData: setTypePokemonDetailData): void => {
  // ロード中にする
  setIsLoading(true);
  asynchroFunction(url, setPreURL, setNextURL, setIsLoading, setPokemonDetailData);
};
