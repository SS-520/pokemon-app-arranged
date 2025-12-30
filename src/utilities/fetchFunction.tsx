import { Result, ResultAsync, err, ok } from 'neverthrow'; // neverthrowライブラリを読み込み
import type { FetchError } from './typesFetch';

//
//// fetch処理の共通部品
//

/*** @name fetchToResultAsync
 * fetch(url)処理の共通化
 * 共通化: fetch処理を実行し、ネットワークエラーを安全な Err<NETWORK_ERROR> に変換する。
 * 1. fetch の Promise (rejectする可能性がある) を ResultAsync (rejectしない) に変換する。
 * 2. Promiseがrejectされた場合（ネットワークエラー等）は AppError.NETWORK_ERROR に変換する。
 * @param url リクエストURL
 * @returns fetchの結果を保持する ResultAsync<Response, AppError>
 */
export function fetchToResultAsync(url: string, signal: AbortSignal): ResultAsync<Response, FetchError> {
  // APIを叩いて結果をfetchPromiseに格納
  const fetchPromise = fetch(url, { signal });

  // fetchの結果を加工して返す
  // 成功：Response≒fetchのresolve
  // 失敗：rejectError:FetchError型≒fetchのreject
  return ResultAsync.fromPromise(fetchPromise, (rejectError) => {
    // ネットワークエラー（Promiseのreject = rejectError）をここで捕捉し、err に変換

    // 1. AbortErrorによる強制エラーか確認
    const isAbortError = rejectError instanceof Error && rejectError.name === 'AbortError';
    if (isAbortError) {
      // 強制終了（Abort）の場合は専用のタイプを返す
      return {
        type: 'ABORTED_STOP',
        message: rejectError.message,
        url: url,
      } as FetchError;
    }

    // 通常エラー
    return {
      type: 'NETWORK_ERROR',
      message: `ネットワーク接続に失敗: ${rejectError instanceof Error ? rejectError.message : '不明なエラー'}`, // 三項演算子
      url: url,
    } as FetchError; //unknown型をFetchErrorに変換・確定
  });
}

/*** @name checkResponseAndParseJson
 *   HTTPステータスチェックとJSON解析（非同期）の共通化
 * 【責務】非同期処理の管理と、同期ヘルパー関数のチェーン接続。
 *   @function
 *   @type ResultAsync<T, FetchError> ：箱（ResultAsync）だけ
 *   @param resFetch: Response
 *   @param url: string（APIのURL）
 *   @return ResultAsync<T, FetchError>
 *   成功時の型 T は呼び出し元に応じる＝ジェネリクスTで指定する。
 */

export const checkResponseAndParseJson = <T,>(resFetch: Response, url: string): ResultAsync<T, FetchError> => {
  // レスポンスボディを複数回読み取るためにクローンを作成
  const errorResponseClone = resFetch.clone();

  // ボディ読み込みを ResultAsync に変換 (非同期処理１)
  const responseBodyText: ResultAsync<string, FetchError> = ResultAsync.fromPromise(
    // promiseをResultAsync<成功,失敗>に変換
    errorResponseClone.text(), // 成功
    (readEError: unknown): FetchError => ({
      type: 'BODY_READ_ERROR',
      message: `レスポンスボディの読み込み中にエラーが発生しました: ${readEError}`,
      context: { url: url, responseSnippet: '(Body read failed)' },
    }),
  );

  // チェーン接続でパース処理＋JSON解析して結果をreturn
  return (
    responseBodyText
      // 読み込んだボディテキストを使ってHTTPステータスをチェック
      // 成功時はbodyTextが渡され、失敗時はerr(FetchError)でチェーンが中断
      .andThen((resultAsyncBodyText: string) => checkHttpErrorStatus(resFetch, resultAsyncBodyText, url))
      .andThen((resultAsyncBodyText: string) => parseJsonBody<T>(resultAsyncBodyText, url))
  );
};

/*** @name checkHttpErrorStatus
 *   HTTPステータスが正常(ok)かチェックし、エラーならFetchErrorを返す
 * 【責務】非同期処理の管理と、同期ヘルパー関数のチェーン接続。
 *   @function
 *   @type ResultAsync<string, FetchError> ：箱（ResultAsync）だけ
 *   @param resFetch: Response(Responseオブジェクト)
 *   @param bodyText: string(読み込まれたレスポンスボディテキスト)
 *   @param url: string（APIのURL）
 *   @return ResultAsync<string, FetchError>
 */
const checkHttpErrorStatus = (resFetch: Response, bodyText: string, url: string): Result<string, FetchError> => {
  // レスポンスのステータスがエラーの場合の処理
  if (!resFetch.ok) {
    const httpError: FetchError = {
      type: 'HTTP_ERROR',
      status: resFetch.status,
      message: `HTTPエラーが発生。ステータス： ${resFetch.status}`,
      context: {
        url: url,
        responseSnippet: bodyText.substring(0, 500),
      },
    };
    // HTTPエラーが起きているので即上記で設定した失敗を返す
    return err(httpError);
  }
  // 正常な場合の処理
  // JSON解析を行うためにbodyTextを次に渡す
  return ok(bodyText);
};

/*** @name parseJsonBody
 *   ・JSON文字列をパースし、期待される型 T に変換
 *   ・パースに失敗した場合、FetchError(PARSE_ERROR)を返す
 *   @function
 *   @type ResultAsync<string, FetchError> ：箱（ResultAsync）だけ
 *   @param bodyText: string(JSON変換前の文字列)
 *   @param url: string（APIのURL）
 *   @return 期待型のT or 失敗のFetchError
 */
const parseJsonBody = <T,>(bodyText: string, url: string): Result<T, FetchError> => {
  // Result.fromThrowable の結果を明示的に Result<T, Error> として扱う
  // ※同期処理において例外がおきる可能性がある処理⇒fromThrowableを使用
  const parseResult: Result<T, Error> = Result.fromThrowable(
    // 実行内容：パース実行（第１引数相当）
    () => JSON.parse(bodyText) as T,
    // エラー時の処理：JSON.parseのエラー補足（第２引数相当）
    (error: unknown) => error as Error,
  )();
  // Result.fromThrowable が返す「ラッパー関数」を () で即時実行
  // ⇒実際の Result<T, Error> オブジェクトを取得

  return parseResult.mapErr(
    (jsonParseError: Error): FetchError => ({
      type: 'PARSE_ERROR',
      message: `JSONパースエラーが発生しました: ${jsonParseError.message}`,
      context: {
        url: url,
        responseSnippet: bodyText.substring(0, 500),
      },
    }),
  );
};

/*** @name alertError
 *   ・非同期処理の結果がエラーだった場合、アラートを表示して処理を終わらせる
 *   @function
 *   @type ResultAsync<string, FetchError> ：箱（ResultAsync）だけ
 *   @param bodyText: string(JSON変換前の文字列)
 *   @param url: string（APIのURL）
 *   @return 期待型のT or 失敗のFetchError
 *  ※ジェネリクス型<T>との相性でアロー関数は使用せず通常のfunction構文として記述
 */
export function alertError<T>(result: Result<T, FetchError>): void {
  // そもそもエラー時のみ呼び出されるが、処理の関係上isErrを確定させる
  if (result.isErr() && result.error.type !== 'ABORTED_STOP') {
    // 画面にエラー内容表示
    alert(`情報の取得に失敗しました。詳細は以下の通りです。
      \n通信先：${result.error.context?.url}),
      \nエラータイプ：${result.error.type},
      \n通信ステータス：${result.error.status},
      \nメッセージ：${result.error.message}),
      \nエラーボディ：${result.error.context?.responseSnippet}`);
  }
}
