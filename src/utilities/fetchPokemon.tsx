/* パーツとして使用する関数を記述 */
import type { FetchError, PokemonResult, PokemonListResponse, PokemonDetail, PokemonDetailAndURL } from './types'; // ユーザー定義型を読み込む（type{型}）
import { ResultAsync, fromPromise, err } from 'neverthrow'; // neverthrowライブラリを読み込み

//
// 処理記載開始
//

/*** @name fetchPokemonData
 *   @function
 *   @param initialURL:string(ポケモンAPI)
 *   @return ResultAsync<PokemonDetailAndURL[], FetchError>
 *  ポケモンAPIからデータを取得・加工する全体処理
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */

export const fetchPokemonData = (initialURL: string): ResultAsync<PokemonDetailAndURL, FetchError> => {
  // 1.全ポケデータを取得
  // andThenでチェーンで以下の処理を繋ぎ、すべて終わったら親関数に戻す
  //  1. getAllPokemon(initialURL)でポケモン全情報を取得
  //  2. 成功したらgetAllPokemon()の成功結果を使ってloadPokemon()実行
  //  3. loadPokemon()の戻り値に、getAllPokemonのprevious,nextプロパティも追加する
  //  4. 3の結果がgetAllPokemon()に届く
  //  5. getAllPokemon()に届いた値をfetchPokemonData()の戻り値としてreturnする
  // 最終的に ResultAsync型 で戻る
  return (
    getAllPokemon(initialURL) // src/utilities/pokemon.tsxの関数にAPIのUPLを渡す
      // 成功したら andThen で次の処理
      //  成功結果を変数resAllPokemonに格納して処理
      .andThen((resAllPokemon) => {
        // loadPokemon()が成功⇒結果をgetPokemonInfoに格納
        console.log(resAllPokemon);
        // 個別のポケモンデータを格納
        return (
          loadPokemon(resAllPokemon.results)
            // loadPokemonの結果をsuccessLoadPokemon：PokemonDetail[]とする
            // 前後20匹ずつのURL情報も一緒に格納するために、neverthrowの.mapで加工
            // オブジェクトを直接返す⇒関数と区別するように{}を()で囲む
            .map((successLoadPokemon: PokemonDetail[]) => ({
              pokemonDetailData: successLoadPokemon,
              previous: resAllPokemon.previous,
              next: resAllPokemon.next,
            }))
        );
      })
  );
};

/*** @name getAllPokemon
 *   @function
 *   @type PokemonListResponse
 *   @param url
 *   @return
 *  ポケモンAPIからデータを取得する
 *  neverthrow構文使用
 */

const getAllPokemon = (url: string): ResultAsync<PokemonListResponse, FetchError> => {
  // 中の処理を一気にreturnしちゃう
  return (
    // fetchを含む処理：fetchWrapper使用
    fetchWrapper(url)
      // fetch成功時のResponseオブジェクトを変数resFetchに格納
      // 成功時のみ続けて処理
      //    失敗時はエラーに格納されてここで戻る
      .andThen((resFetch: Response) => {
        // HTTPエラー処理とJSON変換処理を関数で実行
        // 成功結果がPokemonListResponse型JSON
        // ⇒.mapを嚙まさずに直接戻す
        // 失敗でもFetchError型の結果が戻る
        return checkResponseAndParseJson<PokemonListResponse>(resFetch);
      })
  );
};

//
//// ↓↓ 各ポケモンの詳細を取得する処理2つ ↓↓ ////
// * loadPokemon()
// * getPokemon()
//

/*** @name loadPokemon
 *   @function
 *   @type PokemonDetail[]
 *   @param data:PokemonResult[]
 *   @return すべて成功した場合にOk<PokemonDetail[]>を、失敗した場合にErr<エラー>を返す
 *  各ポケモンデータの配列から、ULR部分を取り出す
 *  ※Neverthrow combine + mapで処理
 */
// loadPokemonの詳細
const loadPokemon = (data: PokemonResult[]): ResultAsync<PokemonDetail[], FetchError> => {
  // neverthrowライブラリで処理
  // 引数で受け取ったdata[]に対し、mapで同じ処理を全配列に行う
  // 配列の個々のデータ名を pokemon と定義
  const promisesPokemonData: ResultAsync<PokemonDetail, FetchError>[] = data.map(
    (pokemon) => getPokemon(pokemon.url), //getPokemon：ResultAsync<PokemonDetail, FetchError>を返す
  );

  // ResultAsync.combineを使って、ResultAsyncの配列全体をResultAsync<配列, エラー>に変換
  // 戻り値: ResultAsync<PokemonDetail[], ProcessError>
  // ※combineは配列を返すため、PokemonDetail[] の型になる
  return ResultAsync.combine(promisesPokemonData);
};

/*** @name getPokemon
 *   @function
 *   @type PokemonDetail
 *   @param url:string
 *   @return ResultAsync<SuccessData, FetchError>
 *  引数で受け取ったurlをAPIとして、各ポケモンの詳細情報を取得する
 *  戻り値の型を明示し、async/awaitでより簡潔に処理する
 *  try/catch⇒ neverthrow ライブラリ使用
 */
export const getPokemon = (url: string): ResultAsync<PokemonDetail, FetchError> => {
  // 中の処理を一気にreturnしちゃう
  return (
    // fetchを含む処理：fetchWrapper使用
    fetchWrapper(url)
      // fetch成功時のResponseオブジェクトを変数resFetchに格納
      // 成功時のみ続けて処理
      //    失敗時はエラーに格納されてここで戻る
      .andThen((resFetch: Response) => {
        // HTTPエラー処理とJSON変換処理を関数で実行
        // 成功結果がPokemonListResponse型JSON
        // ⇒.mapを嚙まさずに直接戻す
        // 失敗でもFetchError型の結果が戻る
        return checkResponseAndParseJson<PokemonDetail>(resFetch);
      })
  );
};

//
//// 共通部品
//

/*** @name checkResponseAndParseJson
 *   HTTPステータスチェックとJSON解析（非同期）の共通化
 *   @function
 *   @type ResultAsync<T, FetchError>
 *   @param resFetch: Response
 *   @return ResultAsync<T, FetchError>
 *   成功時の型 T はジェネリクスで指定する。
 */

const checkResponseAndParseJson = <T,>(resFetch: Response): ResultAsync<T, FetchError> => {
  if (!resFetch.ok) {
    // res.okがfalseの場合、throwではなく Err の箱を返す
    const httpError: FetchError = {
      type: 'HTTP_ERROR',
      message: `HTTPエラーが発生: ${resFetch.status}`,
      status: resFetch.status,
    };
    // 失敗報告書ををResultAsyncに変換して返す
    // ⇒呼び出し元のandThen内で型を合わせるため
    return new ResultAsync(Promise.resolve(err(httpError))); //err：neverthrowのメソッド
    // ※同期的な Result を非同期の ResultAsync に変換する
    // 1. err(httpError): 確定した同期的な失敗報告書（Result）を作成。
    // 2. Promise.resolve(...): その報告書を「即座に成功する Promise」でラップ。
    // 3. new ResultAsync(...): 「結果が確定している Promise<Result>」を、ResultAsync の箱として構築
  }

  return fromPromise(
    // Tは呼び出し元が期待する成功時の型（PokemonListResponseまたはPokemonDetail）
    resFetch.json() as Promise<T>,
    // JSON解析エラーが発生した場合、それを失敗報告書(変数error)に変換
    (error): FetchError => ({
      type: 'PARSE_ERROR',
      message: `JSON解析エラー: ${(error as Error).message}`,
    }),
  );
};

/*** @name fetchWrapper
 *  fetch(url)処理の共通化
 *   @function
 *   @param url: string
 *   @return ResultAsync<Response, FetchError>：fetchの結果
 *   共通化: fetch処理を実行し、ネットワークエラーを安全な Err<NETWORK_ERROR> に変換する。
 */
const fetchWrapper = (url: string): ResultAsync<Response, FetchError> => {
  // fetch処理を「大声（例外）を出す Promise」として neverthrowのメソッド・fromPromise でラップ
  // fromPromiseはneverthrowのメソッド・「ResultAsyncの箱」に変身させる道具なので、戻り値の型はPromise型かつResultAsync<成功,失敗>

  // 成功：Response≒fetchのresolve
  // 失敗：FetchError≒fetchのreject
  return fromPromise(
    fetch(url), // fetchは成功時にPromise<Response>を返す
    (error: unknown): FetchError => ({
      // errorは暗黙的にunknownと推察される
      // Promiseが reject (ネットワークエラーなど) されたとき、
      //    その例外(Error)を Err の失敗報告書(FetchError型)に変換する
      type: 'NETWORK_ERROR',
      message: `ネットワーク接続に失敗: ${(error as Error).message}`,
      // ここではerrorがunknownのままだとプロパティが使用できない
      // ⇒型アサーションでError型に定義
    }),
  );
};
