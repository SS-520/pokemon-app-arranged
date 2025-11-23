import type { setURL, setBoolean, setTypePokemonDetailData } from './types-utility';
/***  処理記述 ***/
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
export declare const asynchroFunction: (url: string, setPreURL: setURL, setNextURL: setURL, setIsLoading: setBoolean, setPokemonDetailData: setTypePokemonDetailData) => Promise<void>;
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
export declare const movePage: (url: string, setPreURL: setURL, setNextURL: setURL, setIsLoading: setBoolean, setPokemonDetailData: setTypePokemonDetailData) => void;
