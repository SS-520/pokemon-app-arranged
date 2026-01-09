/* パーツとして使用する関数を記述 */
import { errAsync, ok, ResultAsync } from 'neverthrow'; // neverthrowライブラリを読み込み
import type { FetchError, PokemonListResponse } from '../types/typesFetch'; // ユーザー定義型を読み込む（type{型}）
import { fetchToResultAsync, checkResponseAndParseJson } from './fetchFunction';

//
// 処理記載開始
//

// APIの更新があるか確認
/*** @name getNowAPI
 *   @function arrow, async/await
 *   @param initialURL:string(ポケモンAPI)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return ResultAsync<Number, FetchError>
 *  ポケモンAPIから'count'の値を取得する（更新の有無の確認）
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */
export const getNowAPI = (initialURL: string, signal: AbortSignal): ResultAsync<PokemonListResponse, FetchError> => {
  return (
    // fetchを含む処理：fetchToResultAsync使用
    fetchToResultAsync(initialURL, signal)
      // fetch成功時のResponseオブジェクトを変数resFetchに格納
      // 成功時のみ続けて処理
      //    失敗時はエラーに格納されてここで戻る
      .andThen((resFetch: Response) => {
        // HTTPエラー処理とJSON変換処理を関数で実行
        // 成功結果がPokemonListResponse型JSON
        // 失敗でもFetchError型の結果が戻る
        //
        // ResultAsyncの「箱」とPromiseの「約束」が返ってくる
        // ⇒一旦変数resultCheckで受け取る
        return checkResponseAndParseJson<PokemonListResponse>(resFetch, initialURL); // ResultAsyncの「箱」が返ってくる
      })
  );
};

/*** @name getPokemonDetail
 *   @function
 *   @type T（汎用型）
 *   @param runPokedexNumbers:number[]
 *   @param endPoint:string
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return ResultAsync<T[], FetchError>
 *   指定したAPIからデータを取得する
 */
export function getPokemonDetail<T>(runPokedexNumbers: number[], endPoint: string, signal: AbortSignal): ResultAsync<T[], FetchError> {
  const baseURL: string = `https://pokeapi.co/api/v2/${endPoint}/`;

  const pokemonDetails: ResultAsync<T | null, FetchError>[] = runPokedexNumbers.map((number) => {
    // アクセスするAPIを作成
    const url: string = baseURL + number;
    // fetchを含む処理：fetchToResultAsync使用
    return (
      fetchToResultAsync(url, signal)
        // fetch成功時のResponseオブジェクトを変数resFetchに格納
        // 成功時のみ続けて処理
        //    失敗時はエラーに格納されてここで戻る
        .andThen((resFetch: Response) => {
          // HTTPエラー処理とJSON変換処理を関数で実行
          // 成功結果がPokemonListResponse型JSON
          // ⇒.mapを嚙まさずに直接戻す
          // 失敗でもFetchError型の結果が戻る
          return checkResponseAndParseJson<T>(resFetch, url);
        })
        // ABORTEDで止まった場合の処理
        .orElse((fetchError) => {
          if (fetchError.type === 'ABORTED_STOP') {
            return ok(null);
            // 成功のnull⇒combineでエラーにならないよう処理
          }
          // ABORTED_STOP以外は通常のエラー
          // 失敗の箱を非同期で作る
          return errAsync(fetchError);
        })
    );
  });

  // checkResponseAndParseJsonの結果を加工⇒.map
  // ABORTED停止によるnullの除去処理含む
  return ResultAsync.combine(pokemonDetails).map((dataList) => {
    // 取得データの中からnull以外のデータのみ抽出
    const getData = dataList.filter((data): data is T => data !== null);

    // null以外のデータがある＝成功
    if (getData.length > 0) {
      console.log('APIによるデータ取得成功', getData);
    }
    return getData;
  });
}
