/* パーツとして使用する関数を記述 */
import type { FetchError, PokemonResult, PokemonListResponse, PokemonDetail } from './types'; // ユーザー定義型を読み込む（type{型}）
import { ResultAsync, fromPromise, err } from 'neverthrow'; // neverthrowライブラリを読み込み

/*** @name getAllPokemon
 *   @function
 *   @type PokemonListResponse
 *   @param url
 *   @return
 *  ポケモンAPIからデータを取得する
 *  getPokemon()（後述）のようにasync/await記法もできるが、練習のため.then()構文を使用
 */

export const getAllPokemon = (url: string): Promise<PokemonListResponse> => {
  // resolve:成功
  // resolve:失敗
  // Promise：fetch以下の処理が終わるまで待機
  return new Promise<PokemonListResponse>((resolve, reject) => {
    // fetchで引数のURLに対しAPIを接続して情報取得
    fetch(url)
      // 成功ルート
      .then((res: Response) => {
        // resがResponse型なのは自動型推論されるので、省略可（今回は練習なので記述）
        // HTTPエラーコード(4xx/5xx)も Promise は成功とみなすため、チェックを追加
        // HTTPエラーコードで返ってきたときの処理
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`); // Error型の新規オブジェクトとして生成→errorもError型
        }
        return res.json(); //res: fetchで受け取ったデータを格納した変数⇒json形式に変換（data）
      })
      // dataはjson形式かつresolveとして返されるので、Promiseと同じ結果→PokemonListResponse型
      .then((data: PokemonListResponse) => resolve(data)) // dataを「成功」として返す（resolve関数使用）【成功ルート完了】
      // ここから失敗ルート
      .catch((error: Error) => {
        // errorの型はTypeErrorになることもあるので、anyか自動推論に任せてもOK
        // fetchや res.json() で発生したエラーを Promise の失敗ルートに送る
        reject(error);
      });
  });
};

/*** @name loadPokemon
 *   @function
 *   @type PokemonDetail[]
 *   @param data:PokemonResult[]
 *   @return すべて成功した場合にOk<PokemonDetail[]>を、失敗した場合にErr<エラー>を返す
 *  各ポケモンデータの配列から、ULR部分を取り出す
 *  ※Neverthrow combine + map
 */
// loadPokemonの詳細
export const loadPokemon = (data: PokemonResult[]): ResultAsync<PokemonDetail[], FetchError> => {
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
  // fetch処理を「大声（例外）を出す Promise」として neverthrowのメソッド・fromPromise でラップ
  // fromPromiseはneverthrowのメソッド・「ResultAsyncの箱」に変身させる道具なので、戻り値の型はPromise型かつResultAsync<成功,失敗>
  // 成功：Response≒fetchのresolve
  // 失敗：FetchError≒fetchのreject
  const fetchPokemonDetail: ResultAsync<Response, FetchError> = fromPromise(
    fetch(url), // fetchは成功時にPromise<Response>を返す
    (error: unknown): FetchError => ({
      // errorは暗黙的にunknownと推察される
      // ❌ Promiseが reject (ネットワークエラーなど) されたとき、
      //    その例外(Error)を Err の失敗報告書(FetchError)に変換する
      type: 'NETWORK_ERROR',
      message: `ネットワーク接続に失敗: ${(error as Error).message}`,
      // ここではerrorがunknownのままだとプロパティが使用できない
      // ⇒型アサーションでError型に定義
    }),
  );
  // andThen⇒Responseが成功(Ok)した場合の次の処理を継続する
  return (
    fetchPokemonDetail
      .andThen((resFetch: Response) => {
        // fetch成功時のResponseオブジェクトを変数resFetchに格納
        // Response型には要素としてok,statusが含まれている

        // HTTPステータスコードのチェック⇒従来のtry内のステータス確認の工程
        if (!resFetch.ok) {
          // res.okがfalseの場合、throwではなく Err の箱を返す
          const httpError: FetchError = {
            type: 'HTTP_ERROR',
            message: `HTTPエラーが発生: ${resFetch.status}`,
            status: resFetch.status,
          };
          // ResultAsync内で失敗報告書を返す
          return err(httpError); //err：neverthrowのメソッド
        }
        // HTTPステータスコードのチェックここまで

        // JSON解析処理も fromPromise で安全にラップする
        return fromPromise(
          resFetch.json() as Promise<PokemonDetail>,
          // JSON解析エラーが発生した場合、それを失敗報告書(変数error)に変換
          (error): FetchError => ({
            type: 'PARSE_ERROR',
            message: `JSON解析エラー: ${(error as Error).message}`,
          }),
        );
        // JSON解析のエラー処理ここまで
      })
      // fetchPokemonDetailの処理が終わったらmapで仕上げ処理
      // PokemonDetail型に変換したjson()を変数pokemonDetailDataに入れる
      .map((pokemonDetailData: PokemonDetail) => {
        // jsonを返す
        return pokemonDetailData;
      })
  );
};

/*** @name loadPokemonTryCatch（使わない・参考用に残す）
 *   @function
 *   @type PokemonDetail[]
 *   @param data:PokemonResult[]
 *   @return PokemonDetail[]
 *  各ポケモンデータの配列から、ULR部分を取り出す
 */
// loadPokemonの詳細
// export const loadPokemonTryCatch = async (data: PokemonResult[]): Promise<PokemonDetail[]> => {
//   try {
//     // 内部変数_pokemonDataを定義
//     // Promise.all()内部の処理がすべて終わったら結果をpokemonDataに格納
//     const _pokemonData = await Promise.all(
//       // 引数で受け取ったdata[]に対し、mapで同じ処理を全配列に行う
//       // 配列の個々のデータ名を pokemon と定義
//       data.map((pokemon: PokemonResult) => {
//         // console.log(pokemon);
//         const pokemonRecord: ResultAsync<PokemonDetail, FetchError> = getPokemon(pokemon.url);
//         return pokemonRecord; //結果は_pokemonDataに格納される
//       }),
//     );
//     return _pokemonData; // 結果を戻す
//   } catch (error) {
//     // 型ガード⇒errorが Error オブジェクトであることを確認する
//     if (error instanceof Error) {
//       // Error型確定⇒安全に message にアクセス可能
//       console.error('loadPokemon()においてデータ取得中にエラーが発生しました。処理を停止します:', error.message);
//       alert('エラーが発生しました。詳細はコンソールログを確認してください');
//       // ※ loadPokemon の役割は「データをロードして終わり」なので
//       // コンソール出力だけで処理を止める⇒throwしない
//     } else {
//       // 予期せぬ、Errorオブジェクトではない何かが飛んできた場合
//       console.error('loadPokemon()において予期せぬエラーが発生しました:', error);
//     }
//     // 失敗時: 呼び出し元に空の配列を返し、「データはゼロ件だった」と伝える
//     // ※戻り値の型がオブジェクトの配列型のため
//     return [];
//   }
// };

/*** @name getPokemonTryCatch（使わない・参考用に残す）
 *   @function
 *   @type PokemonDetail
 *   @param url:string
 *   @return Promise<PokemonDetail>
 *  引数で受け取ったurlをAPIとして、各ポケモンの詳細情報を取得する
 *  戻り値の型を明示し、async/awaitでより簡潔に処理する
 * try/catch, async/await処理
 */
// export const getPokemonTryCatch = async (url: string): Promise<PokemonDetail> => {
//   // try/catchで処理
//   try {
//     // fetch(url)で通信が終わるのを待って(await)、resに格納
//     const res: Response = await fetch(url);

//     // HTTPエラーコード(4xx/5xx)も Promise は成功とみなすため、チェックを追加
//     // HTTPエラーコードで返ってきたときの処理
//     if (!res.ok) {
//       throw new Error(`HTTP Error: ${res.status}`); // Error型の新規オブジェクトとして生成→errorもError型
//     }

//     // res.JSON()⇒ json変換
//     // await res.json()⇒json化が全部終わるのを待つ
//     return (await res.json()) as PokemonDetail;
//     // 成功処理ここまで
//   } catch (error) {
//     // error の型は unknown に推論される

//     // 投げられたものが本当に Error オブジェクトであるかを確認する
//     if (error instanceof Error) {
//       // ここでは error が安全に Error 型として扱える
//       console.error('getPokemon()内：Fetchエラー:', error.message);
//       console.error('スタックトレース:', error.stack);

//       throw error; // throw するエラーも Error 型であることが保証される
//     } else {
//       // Error オブジェクト以外の何かが投げられた場合
//       console.error('getPokemon()内で予期せぬエラーが発生しました:', error);
//       // unknown のまま throw するか、新しい Error にラップして throw します
//       throw new Error(`予期せぬエラー: ${String(error)}`);
//     }
//   }
// };

/* Promise/.then構文での記法（使用しない・参考用に残す） */
// export const getPokemonPromise = (url: string) => {
//   // APIで取得した情報を戻す
//   return new Promise<PokemonDetail>((resolve, reject) => {
//     // fetchで引数のURLに対しAPIを接続して情報取得
//     fetch(url)
//       // 成功ルート
//       .then((res: Response) => {
//         // resがResponse型なのは自動型推論されるので、省略可（今回は練習なので記述）
//         // HTTPエラーコード(4xx/5xx)も Promise は成功とみなすため、チェックを追加
//         // HTTPエラーコードで返ってきたときの処理
//         if (!res.ok) {
//           throw new Error(`HTTP Error: ${res.status}`); // Error型の新規オブジェクトとして生成→errorもError型
//         }
//         return res.json(); //res: fetchで受け取ったデータを格納した変数⇒json形式に変換（data）
//       })
//       // dataはjson形式かつresolveとして返されるので、Promiseと同じ結果→PokemonDetail型
//       .then((data: PokemonDetail) => {
//         resolve(data);
//       }) // dataを「成功」として返す（resolve関数使用）【成功ルート完了】
//       // ここから失敗ルート
//       .catch((error: Error) => {
//         // errorの型はTypeErrorになることもあるので、anyか自動推論に任せてもOK
//         // fetchや res.json() で発生したエラーを Promise の失敗ルートに送る
//         reject(error);
//       });
//   });
// };
