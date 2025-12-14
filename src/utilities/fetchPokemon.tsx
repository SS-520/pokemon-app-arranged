/* パーツとして使用する関数を記述 */
import { useRef, type RefObject } from 'react';
import type { FetchError, PokemonResult, PokemonListResponse, PokemonDetail, PokemonDetailAndURL } from './typesFetch'; // ユーザー定義型を読み込む（type{型}）
import { Result, ResultAsync, fromPromise, err } from 'neverthrow'; // neverthrowライブラリを読み込み

//
// 処理記載開始
//

// APIの更新があるか確認
/*** @name getNowCount
 *   @function
 *   @param initialURL:string(ポケモンAPI)
 *   @return ResultAsync<Number, FetchError>
 *  ポケモンAPIから'count'の値を取得する（更新の有無の確認）
 *  neverthrow構文使用
 *  内部関数のエラーの結果は、すべてFetchErrorに格納されて排出される
 */
export const getNowCount = (initialURL: string): ResultAsync<number, FetchError> => {
  return (
    // fetchを含む処理：fetchToResultAsync使用
    fetchToResultAsync(initialURL)
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
        const resultPromiseResultAsync: Promise<ResultAsync<PokemonListResponse, FetchError>> = checkResponseAndParseJson<PokemonListResponse>(resFetch, initialURL); // ResultAsyncの「箱」とPromiseの「約束」が返ってくる

        // ResultAsync.fromPromise でresultCheckの外側の Promise を剥がす
        return ResultAsync.fromPromise(
          resultPromiseResultAsync, // checkResponseAndParseJsonが失敗でも成功でもそのままの結果が入る
          // 現時点：resultPromiseResultAsync=ResultAsync<結果の箱, FetchError >
          //
          // Promise剥がしが失敗した場合のエラーハンドリング
          (errorResultPromiseResultAsync: unknown): FetchError => ({
            type: 'UNKNOWN_ERROR',
            message: `resultPromiseResultAsyncのPromiseの実行中に予期せぬエラーが発生しました: ${errorResultPromiseResultAsync}`,
            context: { url: initialURL, responseSnippet: 'N/A' },
          }),
        ).andThen(
          // Promise剥がしが成功した場合に実行
          // resultPromiseResultAsync=ResultAsync<結果の箱, FetchError >を
          // 変数:<結果の箱, FetchError >に変換
          (innerResultPromiseResultAsync: ResultAsync<PokemonListResponse, FetchError>) => innerResultPromiseResultAsync, // 一行アロー関数
        );
      })
      // checkResponseAndParseJson・Promise剥がしの全てが成功した場合
      .map((data: PokemonListResponse) => {
        return data.count;
      })
  );
};

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
    fetchToResultAsync(url)
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
    fetchToResultAsync(url)
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

/*** @name fetchToResultAsync
 * fetch(url)処理の共通化
 * 共通化: fetch処理を実行し、ネットワークエラーを安全な Err<NETWORK_ERROR> に変換する。
 * 1. fetch の Promise (rejectする可能性がある) を ResultAsync (rejectしない) に変換する。
 * 2. Promiseがrejectされた場合（ネットワークエラー等）は AppError.NETWORK_ERROR に変換する。
 * @param url リクエストURL
 * @returns fetchの結果を保持する ResultAsync<Response, AppError>
 */
function fetchToResultAsync(url: string): ResultAsync<Response, FetchError> {
  // APIを叩いて結果をfetchPromiseに格納
  const fetchPromise = fetch(url);

  // fetchの結果を加工して返す
  // 成功：Response≒fetchのresolve
  // 失敗：rejectError:FetchError型≒fetchのreject
  return ResultAsync.fromPromise(fetchPromise, (rejectError) => {
    // ネットワークエラー（Promiseのreject = rejectError）をここで捕捉し、err に変換
    return {
      type: 'NETWORK_ERROR',
      message: `ネットワーク接続に失敗: ${rejectError instanceof Error ? rejectError.message : '不明なエラー'}`, // 三項演算子
      url: url,
    } as FetchError; //unknown型をFetchErrorに変換・確定
  });
}

/*** @name checkResponseAndParseJson
 *   HTTPステータスチェックとJSON解析（非同期）の共通化
 *   @function
 *   @type Promise<ResultAsync<T, FetchError>> ：約束（Promise）が入った箱（ResultAsync）
 *   @param resFetch: Response
 *   @return ResultAsync<T, FetchError>
 *   成功時の型 T はジェネリクスで指定する。
 */

const checkResponseAndParseJson = async <T,>(resFetch: Response, url: string): Promise<ResultAsync<T, FetchError>> => {
  // レスポンスボディを複数回読み取るためにクローンを作成
  const errorResponseCloneHTTP = resFetch.clone();
  const errorResponseCloneJSON = resFetch.clone();

  // レスポンスに以上があった場合：returnするエラー内容を整理

  /* HTTPエラー処理 */
  if (!errorResponseCloneHTTP.ok) {
    // HTTPエラーレスポンスのボディを非同期で読み込む
    // readResponseBodyTextを呼び出してエラーメッセージを文字列に格納
    const errorBodyTextHTTP: string = await readResponseBodyText(errorResponseCloneHTTP, url);

    // エラー詳細を準備
    const httpError: FetchError = {
      type: 'HTTP_ERROR',
      status: errorResponseCloneHTTP.status,
      message: `HTTPエラーが発生。ステータス： ${errorResponseCloneHTTP.status}`,
      context: {
        url: url,
        responseSnippet: errorBodyTextHTTP.substring(0, 500),
      },
    };

    // 失敗報告書ををResultAsyncに変換して返す
    // ⇒呼び出し元のandThen内で型を合わせるため
    return new ResultAsync(Promise.resolve(err(httpError)));
    //err：neverthrowのメソッド
    // ※同期的な Result を非同期の ResultAsync に変換する
    // 1. err(httpError): 確定した同期的な失敗報告書（Result）を作成。
    // 2. Promise.resolve(...): その報告書を「即座に成功する Promise」でラップ。
    // 3. new ResultAsync(...): 「結果が確定している Promise<Result>」を、ResultAsync の箱として構築
  }

  /* JSON解析処理 */
  return fromPromise(
    // Tは呼び出し元が期待する成功時の型（PokemonListResponseまたはPokemonDetail）
    resFetch.json() as Promise<T>,
    // JSON解析エラーが発生した場合、後続処理用の暫定エラーオブジェクトを作成
    // 「rejectの場合、unknown型の変数・originalErrorにreject結果を詰めたオブジェクトをjsonErrorの箱に格納する」の意味
    (jsonError): { originalError: unknown } => ({ originalError: jsonError }),
    // fromPromise の結果の ResultAsync を「失敗」としてorElseに繋げる
  ).orElse((tempError) => {
    // ResultAsync のコンストラクタに、即時実行されるasync関数を渡す
    // orElseは「結果がすぐ返る」ことを期待している
    // ⇒ResultAsyncの中身を即時実行する必要有
    return new ResultAsync( // 結果が入った箱を作る
      // ここから手順書（非同期＝時間がかかる）
      (async () => {
        // 直前の失敗（tempError = jsonError{originalError:unknown}）を基に
        // orElse ブロック内で非同期処理 (await) を実行し、ボディを読み込む
        // ※JSON解析エラーが発生時のみ以下を実行

        // 失敗したPromiseの引数（tempError.originalError）からメッセージを取得
        const parseErrorMessage = `JSON解析エラー: ${(tempError.originalError as Error).message}`;

        // readResponseBodyJSONを呼び出してエラーメッセージを文字列に格納
        const errorBodyTextJSON: string = await readResponseBodyText(errorResponseCloneJSON, url);

        const parseError: FetchError = {
          type: 'PARSE_ERROR',
          message: parseErrorMessage, // JSON解析失敗のメッセージ
          context: {
            url: url,
            responseSnippet: errorBodyTextJSON.substring(0, 500), // 大元のレスポンスのボディメッセージ
          },
        };

        // 確定した失敗 (FetchError型) を Result として返す
        // parseErrorにおいて「成功時にはT型を持つはずだったが、今回はFetchError型のエラーで失敗した」の意図を明示する
        const finalResult: Result<T, FetchError> = err<T, FetchError>(parseError);

        // ※この処理はJSON解析失敗時のみ実行＝エラーが返る
        // return new ResultAsync(Promise.resolve(finalResult));
        return finalResult;
      })(), // 即時実行(IIAFE)：手順書の中身を即実行した結果⇒ResultAsyncの箱に格納される
    );
  });
};

/*** @name readResponseBodyText
 * fetch処理におけるレスポンスのボディを読み取る処理
 * 非同期処理：async/await
 * @param response 元のレスポンス（未読）
 * @param url リクエストURL
 * @returns ボディメッセージ Promise<string>
 */
async function readResponseBodyText(response: Response, url: string): Promise<string> {
  // Response.text() の実行と Result でのラップ
  const errorBodyTextResult: Result<string, FetchError> = await fromPromise(
    response.text(), // 成功の場合：ボディをそのまま返す
    (e: unknown): FetchError => ({
      // 失敗の場合：エラー型に整理して返す
      type: 'BODY_READ_ERROR',
      message: `ボディ読み込み失敗: ${(e as Error).message}`,
      context: { url: url },
    }),
  );

  // Result の判定と結果の返却
  // 判定式
  //    1. errorBodyTextResult: null/undefinedでないか
  //    2. 'isOk' in errorBodyTextResult: Result型に含まれるisOkプロパティが存在するか⇒Runtime Error（実行時エラー）防止
  //    3. errorBodyTextResult.isOk(): isOkがtrueか否か
  if (errorBodyTextResult && 'isOk' in errorBodyTextResult && errorBodyTextResult.isOk()) {
    // 3段階認証が全て成功時: 読み込んだボディテキストを返す
    return errorBodyTextResult.value;
  } else {
    // 1つでも失敗時: エラー内容をコンソールに出力し、代替テキストを返す
    console.error('エラーボディの読み込みに失敗しました:', errorBodyTextResult);
    return '(Failed to read error body)';
  }
}
