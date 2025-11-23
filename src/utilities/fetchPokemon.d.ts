import type { FetchError, PokemonDetail, PokemonDetailAndURL } from './types';
import { ResultAsync } from 'neverthrow';
/*** @name fetchPokemonData
 *   @function
 *   @param initialURL:string(ポケモンAPI)
 *   @return ResultAsync<PokemonDetailAndURL[], FetchError>
 *  ポケモンAPIからデータを取得・加工する全体処理
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */
export declare const fetchPokemonData: (initialURL: string) => ResultAsync<PokemonDetailAndURL, FetchError>;
/*** @name getPokemon
 *   @function
 *   @type PokemonDetail
 *   @param url:string
 *   @return ResultAsync<SuccessData, FetchError>
 *  引数で受け取ったurlをAPIとして、各ポケモンの詳細情報を取得する
 *  戻り値の型を明示し、async/awaitでより簡潔に処理する
 *  try/catch⇒ neverthrow ライブラリ使用
 */
export declare const getPokemon: (url: string) => ResultAsync<PokemonDetail, FetchError>;
