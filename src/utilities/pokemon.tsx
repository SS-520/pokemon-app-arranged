/* パーツとして使用する関数を記述 */
import type { PokemonResult, PokemonListResponse, PokemonDetail } from './types'; // ユーザー定義型を読み込む（type{型}）

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
 *   @return PokemonDetail[]
 *  各ポケモンデータの配列から、ULR部分を取り出す
 */
// loadPokemonの詳細
export const loadPokemon = async (data: PokemonResult[]): Promise<PokemonDetail[]> => {
  try {
    // 内部変数_pokemonDataを定義
    // Promise.all()内部の処理がすべて終わったら結果をpokemonDataに格納
    const _pokemonData = await Promise.all(
      // 引数で受け取ったdata[]に対し、mapで同じ処理を全配列に行う
      // 配列の個々のデータ名を pokemon と定義
      data.map((pokemon: PokemonResult) => {
        // console.log(pokemon);
        const pokemonRecord: Promise<PokemonDetail> = getPokemon(pokemon.url);
        return pokemonRecord; //結果は_pokemonDataに格納される
      }),
    );
    return _pokemonData; // 結果を戻す
  } catch (error) {
    // 型ガード⇒errorが Error オブジェクトであることを確認する
    if (error instanceof Error) {
      // Error型確定⇒安全に message にアクセス可能
      console.error('loadPokemon()においてデータ取得中にエラーが発生しました。処理を停止します:', error.message);
      alert('エラーが発生しました。詳細はコンソールログを確認してください');
      // ※ loadPokemon の役割は「データをロードして終わり」なので
      // コンソール出力だけで処理を止める⇒throwしない
    } else {
      // 予期せぬ、Errorオブジェクトではない何かが飛んできた場合
      console.error('loadPokemon()において予期せぬエラーが発生しました:', error);
    }
    // 失敗時: 呼び出し元に空の配列を返し、「データはゼロ件だった」と伝える
    // ※戻り値の型がオブジェクトの配列型のため
    return [];
  }
};

/*** @name getPokemon
 *   @function
 *   @type PokemonDetail
 *   @param url:string
 *   @return Promise<PokemonDetail>
 *  引数で受け取ったurlをAPIとして、各ポケモンの詳細情報を取得する
 *  戻り値の型を明示し、async/awaitでより簡潔に処理する
 */
export const getPokemon = async (url: string): Promise<PokemonDetail> => {
  // try/catchで処理
  try {
    // fetch(url)で通信が終わるのを待って(await)、resに格納
    const res: Response = await fetch(url);

    // HTTPエラーコード(4xx/5xx)も Promise は成功とみなすため、チェックを追加
    // HTTPエラーコードで返ってきたときの処理
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`); // Error型の新規オブジェクトとして生成→errorもError型
    }

    // res.JSON()⇒ json変換
    // await res.json()⇒json化が全部終わるのを待つ
    return (await res.json()) as PokemonDetail;
    // 成功処理ここまで
  } catch (error) {
    // error の型は unknown に推論される

    // 投げられたものが本当に Error オブジェクトであるかを確認する
    if (error instanceof Error) {
      // ここでは error が安全に Error 型として扱える
      console.error('getPokemon()内：Fetchエラー:', error.message);
      console.error('スタックトレース:', error.stack);

      throw error; // throw するエラーも Error 型であることが保証される
    } else {
      // Error オブジェクト以外の何かが投げられた場合
      console.error('getPokemon()内で予期せぬエラーが発生しました:', error);
      // unknown のまま throw するか、新しい Error にラップして throw します
      throw new Error(`予期せぬエラー: ${String(error)}`);
    }
  }
};

/* Promise/.then構文での記法 */
// export const getPokemon = (url: string) => {
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
