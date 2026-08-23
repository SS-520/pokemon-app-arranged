/* 各種APIからポケモン情報を取得する機能 */

/* 各種機能記述ファイル */

/* 設定・導入 */
import { type Result } from 'neverthrow'; // 非同期処理用ライブラリ
import type { QueryClient } from '@tanstack/react-query';

import type {
  FetchError,
  PokemonListResponse,
  PokemonDetail,
  PokemonSpeciesDetail,
  FormsDetail,
  EncountVersion,
  NameAndURL,
  VersionDetailInner,
  WithId,
} from '../types/typesFetch'; // PokemonListResponse型を使用（type{型}）
import type {
  LsPokemon,
  PokedexNumber,
  setBoolean,
  setNumber,
} from '../types/typesUtility';

import { fetchInitialData, getPokemonDetail } from './fetchPokemon'; // fetchPokemonから各関数を呼び出し
import {
  storageAvailable,
  getEndID,
  getNationalData,
  getJaData,
  getPokedexNumber,
  getDisplayImg,
  createNullSpecies,
  mergeAndUniqueById,
  getLsData,
  isOnlyAlphabet,
  convertVersionIdToJapan,
} from './utilityFunction';

/***  処理記述 ***/

// 画面初回ロード時に行うメイン処理
/*** @name loadPokemonProcess
 *   @function arrow, async/await
 *   @param queryClient: QueryClient, // 呼び出し元に蓄積されたキャッシュ
 *   @param setIsBgLoading:setBoolean(バックグラウンドのローディング判定,useState)
 *   @param setProgress:setNumber (バックグラウンドのローディング進捗,useState)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return void
 * 
  1. fetchで更新があるか確認

  2-1. 更新がない
  2-2. ローカルストレージから表示用のデータを取得
  2-3. 取得したデータを画面に表示

  3-1. 更新がある
  3-2. 最初の30件のデータを取得
  3-3. 表示用データを画面に表示
  3-4. バックグラウンドで残りのデータを取得・格納
*/
export const loadPokemonProcess = async (
  queryClient: QueryClient, // 呼び出し元に蓄積されたキャッシュ
  setIsBgLoading: setBoolean, // バックグラウンド処理の判定
  setProgress: setNumber, // バックグラウンド処理の進捗
  signal: AbortSignal,
): Promise<LsPokemon[]> => {
  // 土台になるポケモンAPIのURLを指定
  const initialURL: string =
    'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

  // APIの最新状況を確認する
  const nowFetchResult: Result<PokemonListResponse, FetchError> =
    await fetchInitialData<PokemonListResponse>(initialURL, signal);
  // エラーの場合終了してreturn
  if (nowFetchResult.isErr()) {
    throw nowFetchResult.error;
  }

  // APIの結果から最新の全国図鑑の番号を切り出し・取得
  const pokedexNumArray: number[] = getEndID(nowFetchResult.value.results);

  // ローカルストレージから保存されているポケモンデータ数を取得
  const currentLsCount = Number(localStorage.getItem('pokeRegCount'));

  // 取得データの最終結果を入れるための変数
  let finalData: LsPokemon[] = [];
  let lsData: Result<LsPokemon[], FetchError> | null = null;

  // 最終的な保留中配列の格納先（配列にpushなのでconstでOK）
  const stillFailedIds: number[] = [];

  // APIからの取得が必要かどうかのフラグ
  let isGetAPI: boolean = false;

  // ローカルストレージに保存されているデータ数とAPIのデータ数が同じ
  if (
    storageAvailable('localStorage') &&
    localStorage.getItem('pokeRegCount') &&
    currentLsCount === nowFetchResult.value.count
  ) {
    const getResult = getLsData<LsPokemon>('pokemonData');

    // 成功してデータがある場合
    if (getResult.isOk() && getResult.value.length > 0) {
      finalData = getResult.value;
      isGetAPI = true;
    }
  } else if (
    storageAvailable('localStorage') &&
    localStorage.getItem('pokeRegCount')
  ) {
    // ローカルストレージに保存されているデータ数とAPIのデータ数が異なる
    // ⇒APIから取得する必要＋ローカルストレージのデータを取得更新する必要がある
    lsData = getLsData<LsPokemon>('pokemonData');

    // 取得保留中のポケモンがいれば先に取得
    const pendingPokemon = getLsData<number[]>('failedList');

    // エラーチェック
    if (pendingPokemon.isErr()) {
      throw pendingPokemon.error;
    }

    // 保留中がある
    if (pendingPokemon.value.length > 0) {
      // 保留中配列をフラット化
      const pendingPokemonArray: number[] = pendingPokemon.value.flat();

      // 保留中のポケモンを取得（ループ）
      // ループ前に現在のLSデータをuseQueryにセット
      if (lsData && lsData.isOk()) {
        // 念のためfinalDataにも判明しているデータは格納
        finalData = applyPokemonUpdates(
          pokedexNumArray,
          { result: lsData.value, failedList: pendingPokemonArray },
          queryClient,
          setProgress,
        );
      }

      // awaitを有効にするのでfor ofを使用
      for (const id of pendingPokemonArray) {
        // 保留中のポケモンを取得実行
        const pendingPokemonData = await getPokemonDataSafely(
          pokedexNumArray,
          pokedexNumArray.indexOf(id),
          1,
          signal,
        );

        // 結果に応じて処理
        finalData = applyPokemonUpdates(
          pokedexNumArray,
          pendingPokemonData,
          queryClient,
          setProgress,
        );

        // 失敗したidはnewPendingPokemonArrayに詰める
        if (pendingPokemonData.failedList.length > 0) {
          stillFailedIds.push(...pendingPokemonData.failedList);
        }
      }
      /* ループ終わり */

      // 保留中が残ってる
      if (stillFailedIds.length > 0) {
        localStorage.setItem('failedList', JSON.stringify(stillFailedIds));
      } else {
        // 保留中全部解消
        localStorage.removeItem('failedList');
      }

      // 終了時点でLSの登録数と最新数が一致
      // 保留中もない
      // ⇒isGetAPIをtrue＋更新したfinalDataを最後に返して終わり
      if (
        Number(localStorage.getItem('pokeRegCount')) ===
          nowFetchResult.value.count &&
        stillFailedIds.length === 0
      ) {
        isGetAPI = true;
      }
    }
  }

  // isGetAPIがfalseのまま⇒APIから取得する必要がある
  if (!isGetAPI) {
    // バックグラウンド処理開始
    setIsBgLoading(true);

    //  一度に取得するAPIの数
    const getAPIcount: number = 30;

    // 時間がかかる処理なので終わるまで次に進めない(await)
    // getNowPokemonDataを5セット150匹取得
    for (let i = 0; i < 5; i++) {
      // 取得済み＋（取得数× i周目）
      const currentStart = currentLsCount + getAPIcount * i;

      // API取得
      const newData: {
        result: LsPokemon[];
        failedList: number[];
      } = await getPokemonDataSafely(
        pokedexNumArray,
        currentStart,
        getAPIcount,
        signal,
      );
      // 取得したnewDataデータをfinalDataにマージして格納
      finalData = applyPokemonUpdates(
        pokedexNumArray,
        newData,
        queryClient,
        setProgress,
      );

      // 失敗したIDはnewPendingPokemonArrayに詰める
      if (newData.failedList.length > 0) {
        stillFailedIds.push(...newData.failedList);
      }
    }

    // 既存のローカルストレージのデータ有⇒finalDataに更にマージ
    if (lsData && lsData.isOk()) {
      finalData = applyPokemonUpdates(
        pokedexNumArray,
        { result: lsData.value, failedList: stillFailedIds },
        queryClient,
        setProgress,
      );
    }

    //  裏で一度に取得するAPIの数
    const getBackAPIcount: number = 30;

    // 取得済み＋（取得数×5周目=150匹）から裏処理は開始
    const nextStartNum: number = currentLsCount + getAPIcount * 5;

    // 残りは裏で取得
    backgroundFetchAPI(
      pokedexNumArray,
      nextStartNum,
      getBackAPIcount,
      queryClient,
      stillFailedIds,
      setIsBgLoading,
      setProgress,
      signal,
    );
  }
  // 最後に、完成したデータを TanStack Query に返す
  // 最初に返るのは既存＋150匹のデータ
  return finalData;
};

//
//
// APIの呼び出し関数と失敗時の処理をまとめた中間関数
/*** @name getPokemonDataSafely
 *   @function arrow, async/await
 *   @param pokedexNumArray:number[](ポケモン管理番号)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @param start:number(開始配列要素番号)
 *   @param run:number(実行件数)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<number>
 *   ・ローカルストレージからデータを取得できない
 *   ・ローカルストレージ保存の内容からAPI側が更新されている
 */

const getPokemonDataSafely = async (
  pokedexNumArray: number[],
  start: number,
  run: number,
  signal: AbortSignal,
): Promise<{ result: LsPokemon[]; failedList: number[] }> => {
  const result: LsPokemon[] = []; // 取得したポケモンデータを格納する配列
  // ループ終了条件（開始値＋実行数と配列の長さを比較して小さい方を採用）
  const limit: number = Math.min(start + run, pokedexNumArray.length);

  let retryCount: number = 0; // エラー時のリトライ回数
  const maxRetryCount: number = 3; // 最大リトライ回数
  const failedList: number[] = []; // エラーで取得できなかった番号リスト

  // globalTry/Catch
  try {
    for (
      let i: number = start;
      i < limit; // ループ変数iの更新は該当ループが無事完了した時に実行
    ) {
      // mainTry/Catch
      // エラーが起きて取得できなくてもリトライする
      try {
        // データ取得
        const newData: LsPokemon[] = await getNowPokemonData(
          pokedexNumArray,
          i,
          run,
          signal,
        );
        // エラー無で取得できたのでリトライ回数リセット
        retryCount = 0;
        // 取得したデータを結果配列に格納
        result.push(...newData);

        // ループ変数を更新して次のループへGO
        i += run;

        /* エラー発生：mainError */
      } catch {
        /* --- ここからmainErrorの処理 --- */
        // エラーが起きたのでリトライ回数加算
        retryCount++;

        console.warn(
          `[リトライ]${i}の取得失敗。${retryCount}回目のリトライ実行`,
        );

        // 最大リトライ回数未満
        if (retryCount < maxRetryCount) {
          // 1秒クールダウンしてからリトライ
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue; // mainループの先頭に戻る（＝塊取得を再試行）
        }

        // 最大リトライ回数を越えた⇒エラー周の対象を１匹ずつ個別取得
        console.warn(`[個別取得]${i}の取得を個別取得に切り替え/エラー処理`);

        // 1匹ずつ取得するfor処理
        for (
          let j = i;
          j < Math.min(i + run, pokedexNumArray.length); // APIの最大数/実行数 の小さい方
          j++
        ) {
          // singleTry/Catch
          try {
            // 1匹ずつ取得処理
            const singleData = await getNowPokemonData(
              pokedexNumArray,
              j,
              1,
              signal,
            );
            // 取得したデータを結果配列に格納
            result.push(...singleData);

            /* 処理詰まりの原因のエラー */
          } catch (singleError) {
            // 本当に取得できない対象を特定
            // 配列に格納
            failedList.push(pokedexNumArray[j]);

            // コンソールにエラーを出す
            console.error(
              `[取得失敗] ID:${pokedexNumArray[j]} は現在データにアクセスできません`,
              singleError,
            );
          }
          // singleループ終わり
        }
        // エラー処理含め対応完了
        // リトライ回数リセット
        retryCount = 0;

        // ループ変数を更新して次のmainループへGO
        i += run;
        /* --- ここまでmainErrorの処理 --- */
      }
      // mainループ終わり：ループ後処理
    }
    /* --- ここからmainErrorの処理 --- */
  } catch (globalError) {
    // singleループで処理できない想定外のエラー発生
    // エラー内容をログに出力
    console.log('backgroundFetchAPI内でエラー発生', globalError);
  }

  // catchのthrowを上書きしないためにfinallyは使わず普通にreturn
  return { result, failedList };
};

//
//
// APIから取得したデータを画面に反映させる
/*** @name getNowPokemonData
 *   @function arrow, async/await
 *   @param pokedexNumArray:number[](ポケモン管理番号)
 *   @param addData:{ result: LsPokemon[]; failedList: number[] }(APIデータを取得加工後の箱)
 *   @param queryClient:QueryClient(react-queryのクライアント)
 *   @param setProgress:setNumber(プログレスバーの値を更新する関数)
 *   @return void
 */

const applyPokemonUpdates = (
  pokedexNumArray: number[],
  addData: { result: LsPokemon[]; failedList: number[] },
  queryClient: QueryClient,
  setProgress: setNumber,
): LsPokemon[] => {
  // 受け取ったデータを画面に反映されるように処理
  // 最終的な結果はreturnする
  return queryClient.setQueryData<LsPokemon[]>(
    ['pokemon', 'all'],
    (currentData: LsPokemon[] | undefined) => {
      // 既存データに新規データをマージ
      // currentDataがなくundefinedの場合は空配列を渡す
      const mergeData: LsPokemon[] = mergeAndUniqueById(
        currentData ?? [],
        addData.result,
      );

      // ローカルストレージが使えるなら保存
      if (storageAvailable('localStorage')) {
        // 既存データに新規データをマージ
        updateLsData(mergeData);

        // エラーリストがあればそれも保存
        if (addData.failedList.length > 0) {
          // 既存のペンディングリストはある？
          const currentFailedList: Result<number[][], FetchError> =
            getLsData<number[]>('failedList');
          if (!currentFailedList.isOk()) {
            throw currentFailedList.error;
          }

          // 既存と新規を結合・並べ替え
          const mergeFailedList: number[] = [
            ...new Set([
              ...addData.failedList,
              ...currentFailedList.value.flat(),
            ]),
          ].toSorted();

          // エラーリストを保存
          localStorage.setItem('failedList', JSON.stringify(mergeFailedList));
        }
      }

      // プログレスバーの値を更新
      setProgress(
        Math.round((mergeData.length / pokedexNumArray.length) * 100),
      );

      // 画面に反映させるためにマージしたデータをsetQueryDataに返す
      return mergeData;
    },
  ) as LsPokemon[]; // unknown回避の念押し型アサーション
};

//
//
// APIから現在のポケモン情報を取得する一式
/*** @name getNowPokemonData
 *   @function arrow, async/await
 *   @param pokedexNumArray:number[](ポケモン管理番号)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @param start:number(開始配列要素番号)
 *   @param run:number(実行件数)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<number>
 *   ・ローカルストレージからデータを取得できない
 *   ・ローカルストレージ保存の内容からAPI側が更新されている
 */
const getNowPokemonData = async (
  pokedexNumArray: number[],
  start: number,
  run: number,
  signal: AbortSignal,
) => {
  // 処理する範囲を指定
  const runNumbers: number[] = pokedexNumArray.slice(start, start + run);

  // ⇒ポケモンAPIから最新データを取得（基本情報）
  const pokemonDetails: Result<PokemonDetail[], FetchError> =
    await getPokemonData<PokemonDetail>(runNumbers, 'pokemon', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonDetails.isErr()) {
    // エラー処理は上層のApp.tsxで行う
    throw pokemonDetails.error;
  }

  // 取得した結果から種類（species）番号を取得
  const tmpSpeciesNum: number[] = pokemonDetails.value.map((detail) => {
    return getEndID([detail.species])[0];
    // getEndIDの戻り値は配列
    // ⇒speciesNumbers(配列)の中に配列を入れるのを防ぐ
    // ⇒index0の要素を取り出してspeciesNumbersという配列に格納
  });

  // ⇒ポケモンAPIから最新データを取得（種類別情報）
  const pokemonSpeciesResult: Result<PokemonSpeciesDetail[], FetchError> =
    await getPokemonData<PokemonSpeciesDetail>(
      tmpSpeciesNum,
      'pokemon-species',
      signal,
    );

  // species未登録データもある
  // ⇒404で返ってくることもあるのでエラーでも後続処理続行
  const pokemonSpecies: PokemonSpeciesDetail[] = pokemonSpeciesResult.match(
    (successData) => successData, // 成功時はそのままデータ保持
    (resultError) => {
      // 該当番号のPokemonSpeciesDetail型をnullで埋めたデータを返す
      console.warn(`id:${tmpSpeciesNum}, species未登録。${resultError.status}`);
      return tmpSpeciesNum.map(
        (id): PokemonSpeciesDetail => createNullSpecies(id),
      );
    },
  );

  //
  // 取得した結果から形態（form）番号を取得
  const tmpFormNum: number[] = pokemonDetails.value.map((detail) => {
    return getEndID(detail.forms)[0];
    // getEndIDの戻り値は配列
    // ⇒speciesNumbers(配列)の中に配列を入れるのを防ぐ
    // ⇒index0の要素を取り出してspeciesNumbersという配列に格納
  });

  const pokemonFormResult: Result<FormsDetail[], FetchError> =
    await getPokemonData<FormsDetail>(tmpFormNum, 'pokemon-form', signal);

  //  form未登録データもある
  // ⇒404で返ってくることもあるのでエラーでも後続処理続行
  const pokemonForm: FormsDetail[] = pokemonFormResult.match(
    (successData) => successData, // 成功時はそのままデータ保持
    (resultError) => {
      // 該当番号のFormsDetail型をnullで埋めたデータを返す
      console.warn(`id:${tmpFormNum}, form未登録。${resultError.status}`);
      return [];
    },
  );

  //
  // 取得した結果から自然遭遇可能なバージョンデータを取得
  // ⇒ポケモンAPIから最新データを取得（基本情報）
  const pokemonEncountVersions: Result<WithId<EncountVersion[]>[], FetchError> =
    await getPokemonData<EncountVersion[]>(
      runNumbers,
      'pokemon',
      signal,
      'encounters',
    );
  // 一連のfetch中のエラーここで最終処理
  if (pokemonEncountVersions.isErr()) {
    // エラー処理は上層のApp.tsxで行う
    throw pokemonEncountVersions.error;
  }

  // 成功値を変数に格納
  const encountVersionsData: WithId<EncountVersion[]>[] = pokemonEncountVersions.value
  
  console.log({ encountVersionsData });

  console.log('')

  // ※matchで成否の処理後なので、全て成功後の型として扱う
  // 3つのAPIから取得した情報でオブジェクトの配列を作って返す
  return await createBaseData(
    pokemonDetails.value,
    pokemonSpecies,
    pokemonForm,
    runNumbers,
    encountVersionsData
  );
};

//
//
/*  数パターンあるのでオーバーロードで記述 */
//
// ポケモン個別APIで詳細データを取得する
/*** @name getPokemonData
 *   @function async/await
 *   @param runPokedexNumbers[]:number[](全国図鑑の番号)
 *   @param endPoint:string(実行先APIのURLのパーツ)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @param suffix:string サブパスがある場合（例：/encounters）
 *   @return Promise<ResultAsync<(T|WithId<T>)[]>, FetchError>
 *  ・詳細データの取得
 */

// 1. 汎用パターン
export async function getPokemonData<T>(
  runPokedexNumbers: number[],
  endPoint: string,
  signal: AbortSignal,
  suffix?: string
): Promise<Result<T[], FetchError>>;

// 2. suffix が 'encounters' の場合、WithId<T>[] を返す型定義
//    使用箇所：このファイル > pokemonEncountVersions
export async function getPokemonData<T>(
  runPokedexNumbers: number[],
  endPoint: string,
  signal: AbortSignal,
  suffix: 'encounters' // 文字リテラルで厳密指定
): Promise<Result<WithId<T>[], FetchError>>;

// 実装本体
export async function getPokemonData<T>(
  runPokedexNumbers: number[],
  endPoint: string,
  signal: AbortSignal,
  suffix?: string,
): Promise<Result<(T|WithId<T>)[], FetchError>> {
  const pokemonDetailResults: Result<(T|WithId<T>)[], FetchError> = await getPokemonDetail(
    runPokedexNumbers,
    endPoint,
    signal,
    suffix,
  );
  // 一連のfetch中にエラー発生⇒先に戻す
  if (pokemonDetailResults.isErr()) {
    const fetchError: FetchError = pokemonDetailResults.error;
    console.error(
      `[データ取得失敗] エラータイプ: ${fetchError.type}`,
      fetchError,
    );

    return pokemonDetailResults; // Errが返る
  }

  return pokemonDetailResults;
}

//
//
// ポケモン個別APIから取得したデータを基に表示・検索・保存に使うデータを整形
/*** @name createBaseData
 *   @function arrow
 *   @param pokemonDetails[]:PokemonDetail[](基本データの配列)
 *   @param pokemonSpecies[]:PokemonSpeciesDetail[](固有データの配列)
 *   @param pokemonForm[]:FormsDetail[](固有データの配列)
 *   @param runNumbers[]:number[](対象の管理番号配列)
 *   @param encountVersionsData[]:WithId<EncountVersion[]>[](登場バージョンデータの配列)
 *   @return Promise<ResultAsync<PokemonDetail[], FetchError>>
 *  ・id:number(管理番号)
 *  ・name:string(名前)
 *  ・type:number[](タイプ番号)
 *  ・pokedex:PokedexNumber(全国図鑑番号)
 *  ・gene:number(初出世代)
 *  ・isGen:number(オスメス差分の有無) Number(boolean)で数値化
 *  ・egg:number[](卵グループ)
 */
const createBaseData = (
  pokemonDetails: PokemonDetail[],
  pokemonSpecies: PokemonSpeciesDetail[],
  pokemonForm: FormsDetail[],
  runNumbers: number[],
  encountVersionsData: WithId<EncountVersion[]>[],
): LsPokemon[] => {
  // id(num)順に並んでいる前提のデータを使うので、id順(index)に処理
  //  ※runNumbers配列のidと、各種オブジェクト配列のidは原則一致の前提で処理
  //  （一致しない場合も一応考慮してfind処理で保険）

  /* ここからmapでrunNumbers配列の数だけループ処理 */
  return runNumbers.map((num: number,index:number) => {

    /* 管理番号(num)に一致するpokemonDetailsのデータを取得 */
    // numPokemonDetailの格納変数を設定＋初期化
    let numPokemonDetail: PokemonDetail | undefined = undefined;
    // index番号で一旦決め打ち取得
    let tmpPokemonDetail: PokemonDetail | undefined = pokemonDetails[index];
    // 取得したデータは存在してる？
    // idがrunNumbersと相違ない？（保険でチェック）
    if (tmpPokemonDetail && tmpPokemonDetail.id !== num) {
      console.warn('id不一致。findで再検索');
      
      // ずれがあったらfindで再取得
      tmpPokemonDetail = pokemonDetails.find((detail) => detail.id === num)
    }
    // 値が存在すればnumPokemonDetailに格納して完了
    if (tmpPokemonDetail) {
      numPokemonDetail = tmpPokemonDetail;
    }

    //
    /* 管理番号(num)に一致するpokemonSpeciesのデータを取得 */
   
    // speciesの格納変数を設定＋初期化
    let numPokemonSpecies: PokemonSpeciesDetail | undefined = undefined;
    // index番号で一旦決め打ち取得
    let tmpPokemonSpecies: PokemonSpeciesDetail | undefined = pokemonSpecies[index];

    // speciesのIDをnumPokemonDetailから取得
    const expectedSpeciesId = numPokemonDetail ? getEndID([numPokemonDetail.species])[0] : undefined;


    // 取得したデータは存在してる？
    // idがnumPokemonDetail.speciesと相違ない？（保険でチェック）
    if (tmpPokemonSpecies
      && expectedSpeciesId !== undefined
      && tmpPokemonSpecies.id !== expectedSpeciesId) {
      console.warn('id不一致。findで再検索');
      
      // ずれがあったらfindで再取得
      tmpPokemonSpecies = pokemonSpecies.find((species) => species.id === expectedSpeciesId)
    }
    // 値が存在すればnumPokemonSpeciesに格納して完了
    if (tmpPokemonSpecies) {
      numPokemonSpecies = tmpPokemonSpecies;
    }

    // 
    /* 管理番号(num)に一致するpokemonFormのデータを取得 */

    // フォームデータの格納変数を設定＋初期化
    let numPokemonForm: FormsDetail | undefined = undefined;

    // index番号で一旦決め打ち取得
    let tmpPokemonForm: FormsDetail | undefined = pokemonForm[index];

    // formのIDをnumPokemonDetailから取得
    const expectedFormId = numPokemonDetail ? getEndID(numPokemonDetail.forms)[0] : undefined;


    // 取得したデータは存在してる？
    // idがnumPokemonDetail.formsと相違ない？（保険でチェック）
    if (tmpPokemonForm
      && expectedFormId !== undefined
      && tmpPokemonForm.id !== expectedFormId) {
      console.warn('id不一致。findで再検索');
      
      // ずれがあったらfindで再取得
      tmpPokemonForm = pokemonForm.find((form) => form.id === expectedFormId)
    }

    // 値が存在すればnumPokemonFormに格納して完了
    if (tmpPokemonForm) {
      numPokemonForm = tmpPokemonForm;
    }


    // 
    /* 管理番号(num)に一致するencountVersionsDataのデータを取得  */

    // 最終的に格納する変数を先に一旦初期化
    let numPokemonEncountVersion: number[] = [];

    // index番号で一旦決め打ち取得
    let tmpVersions: WithId<EncountVersion[]> | undefined = encountVersionsData[index];

    // 取得したデータは存在してる？
    // idがrunNumbersと相違ない？（保険でチェック）
    if (tmpVersions && tmpVersions.id !== num) {
      console.warn('id不一致。findで再検索');
      
      // ずれがあったらfindで再取得
      tmpVersions = encountVersionsData.find((version) => version.id === num) as WithId<EncountVersion[]>;  // 型アサーションで確実に格納
    }

    // tmpVersionsが存在してたら必要な形式に加工して終了
    if (tmpVersions) {
      // 目的のポケモンデータを取得したので加工
      numPokemonEncountVersion = formatEncountVersion(tmpVersions.data);
    }
 

    // オブジェクトに詰める情報の変数宣言
    let setName: LsPokemon['name'] = null;
    let setType: LsPokemon['type'] = [0];
    let setPokedex: LsPokemon['pokedex'] = 0 as PokedexNumber;
    let setSpecies: LsPokemon['sp'] = 0;
    let setRegion: LsPokemon['region'] = [0];
    let setGeneration: LsPokemon['ge'] = 0;
    let setEncountVersion: LsPokemon['ve'] = numPokemonEncountVersion;  // 初期化と加工済なのでそのまま格納
    let setIsGender: LsPokemon['isGen'] = Number(false);
    let setEgg: LsPokemon['egg'] = [0];
    let setImg: LsPokemon['img'] = null;
    let setDifNm: LsPokemon['difNm'] = null;
    let setShowOder: LsPokemon['showOder'] = 0;

    // PokemonDetailの情報を詰める用に加工
    if (numPokemonDetail) {
      // 管理番号と一致するPokemonDetailがある

      // typeの番号を取得
      setType = numPokemonDetail.types.map((data) => {
        // 結果が配列でreturn
        // index:0の結果を受け取る形にする
        return getEndID([data.type])[0];
      });

      // 表示用画像を取得
      setImg = getDisplayImg(numPokemonDetail.sprites);

      // オスメス差分の有無取得
      if (numPokemonDetail.sprites.front_female !== null) {
        setIsGender = Number(true);
      }

      // フォルムチェンジなど、特殊姿の場合
      if (!numPokemonDetail.is_default) {
        setDifNm = numPokemonDetail.name;
      }
      // アローラぬし？
      if (numPokemonDetail.name.includes('totem')) {
        setShowOder = 99;
        setDifNm = 'ぬし（アローラ）';
      }
      // 特殊ピカチュウは表示順を100にする
      if (
        getEndID([numPokemonDetail.species])[0] === 25 &&
        !numPokemonDetail.is_default
      ) {
        setShowOder = 100;
      }
      // サトシゲッコウガも100！
      if (numPokemonDetail.id === 10117) {
        setShowOder = 100;
      }
      // ピカブイイーブイも100！
      if (numPokemonDetail.id === 10159) {
        setShowOder = 100;
      }
    }

    // PokemonSpeciesDetailの情報を詰める用に加工
    if (numPokemonSpecies) {
      // 管理番号と一致するPokemonSpeciesDetailがある

      // 日本語名前を取得
      // PokemonSpeciesDetail['names']が配列定義なので配列のまま処理
      const tmpName: PokemonSpeciesDetail['names'] = getJaData(
        numPokemonSpecies.names,
      );

      // オプショナルチェイニング記法も有だが手堅い三項演算子で処理
      setName = tmpName && tmpName.length > 0 ? tmpName[0].name : null; // tmpNameは配列扱い＝index:0を指定
      console.log({ setName });

      // 全国図鑑番号を取得
      const tmpPokedex: PokemonSpeciesDetail['pokedex_numbers'] =
        getNationalData(numPokemonSpecies.pokedex_numbers);
      // 数値を取り出して型変換
      setPokedex = tmpPokedex[0].entry_number as PokedexNumber;

      // Speciesの値を詰める
      setSpecies = numPokemonSpecies.id;

      // 登場する図鑑（全国図鑑を除く）
      setRegion = getPokedexNumber(numPokemonSpecies.pokedex_numbers);

      // 卵グループ取得
      setEgg = getEndID(numPokemonSpecies.egg_groups);
    }

    // FormsDetailの情報を詰める用に加工
    if (numPokemonForm) {
      // 初出バージョングループ
      setGeneration = getEndID([numPokemonForm.version_group])[0];

      // この時点で画像が空なら取得を試す
      setImg = setImg === null ? getDisplayImg(numPokemonForm.sprites) : setImg;

      // フォーム名を取得
      const tmpFormName: FormsDetail['form_names'] = getJaData(
        numPokemonForm.form_names,
      );
      const tmpName: FormsDetail['form_names'] = getJaData(
        numPokemonForm.names,
      );

      // 言語判定
      if (tmpFormName.length > 0 && !isOnlyAlphabet(tmpFormName[0].name)) {
        // tmpFormNameがある ＋ nameが全てアルファベットではない（日本語）
        setDifNm = tmpFormName[0].name;
      } else if (tmpName.length > 0 && !isOnlyAlphabet(tmpName[0].name)) {
        // tmpNameがある ＋ nameが全てアルファベットではない（日本語）
        setDifNm = tmpName[0].name;
      }

      // 形態によって表示順・表示対象か判定
      //  メガシンカ？
      if (numPokemonForm.is_mega) {
        setShowOder = 11;

        // 言語判定：全部アルファベットなら定数を入れる
        if (setDifNm === null || isOnlyAlphabet(setDifNm)) {
          setDifNm = 'メガシンカ';
        }
      } else if (numPokemonForm.form_name === 'gmax') {
        // 巨大マックス？
        setShowOder = 21;

        // 言語判定：全部アルファベットなら定数を入れる
        if (setDifNm === null || isOnlyAlphabet(setDifNm)) {
          setDifNm = 'キョダイマックス';
        }
      }
    } else {
      // フォーム情報がない場合一部加工
      // form情報ではないので補助処理扱い
      if (setDifNm?.includes('-mega')) {
        // メガシンカ？
        setShowOder = 11;

        // 言語判定：全部アルファベットなら定数を入れる
        if (setDifNm === null || isOnlyAlphabet(setDifNm)) {
          setDifNm = 'メガシンカ';
        }
      } else if (setDifNm?.includes('-gmax')) {
        setShowOder = 21;

        // 言語判定：全部アルファベットなら定数を入れる
        if (setDifNm === null || isOnlyAlphabet(setDifNm)) {
          setDifNm = 'キョダイマックス';
        }
      }
    }


    // 取得したデータから必要情報をオブジェクトに詰める
    const toLSObject: LsPokemon = {
      id: num,
      name: setName,
      type: setType,
      pokedex: setPokedex,
      sp: setSpecies,
      region: setRegion,
      ge: setGeneration,
      ve: setEncountVersion,
      isGen: setIsGender,
      egg: setEgg,
      img: setImg,
      difNm: setDifNm,
      showOder: setShowOder,
    };

    // 作成したオブジェクトを返す
    return toLSObject;
  });
};

//
//
// ポケモン個別APIで詳細データを取得する
/*** @name backgroundFetchAPI
 *   @function async/await
 *   @param pokedexNumArray[]:number[](全国図鑑の番号)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @param getAPIcount:number(１回のAPI実行件数)
 *   @param isBgLoading:RefObject(バックグラウンドのローディング判定,useRef)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<void> 戻り値なし
 *  ・詳細データの取得
 */
const backgroundFetchAPI = async (
  pokedexNumArray: number[],
  gotDataCount: number,
  getAPIcount: number,
  queryClient: QueryClient,
  stillFailedIds: number[],
  setIsBgLoading: setBoolean,
  setProgress: setNumber,
  signal: AbortSignal,
): Promise<void> => {
  const startNum: number = gotDataCount; // ローディングの裏で取得した分の続きから開始

  for (let i: number = startNum; i < pokedexNumArray.length; i += getAPIcount) {
    const newData: {
      result: LsPokemon[];
      failedList: number[];
    } = await getPokemonDataSafely(pokedexNumArray, i, getAPIcount, signal);

    // 取得したデータが画面に反映されるように設定
    applyPokemonUpdates(pokedexNumArray, newData, queryClient, setProgress);

    // 失敗したIDはnewPendingPokemonArrayに詰める
    if (newData.failedList.length > 0) {
      stillFailedIds.push(...newData.failedList);
    }
  }

  // 途中で取得失敗したポケモンがいれば画面に表示
  if (stillFailedIds.length > 0) {
    // 重複を削除（ローカルストレージを使えなくても表示可能な処理）
    const uniqueFailed = [...new Set(stillFailedIds)];

    // メッセージ作成
    const msg: string = `【取得失敗】\n以下の番号のポケモンは取得できませんでした。\nID: ${uniqueFailed.join(', ')}\n\nお手数ですが、しばらく時間をおいたのち、データのリフレッシュを行ってください。`;

    // アラート表示
    alert(msg);

    // コンソールにも表示
    console.warn(`取得失敗したポケモン番号: ${uniqueFailed.join(', ')}`);
  }

  console.log('backgroundFetchAPI finished');

  // ローディング終了
  setIsBgLoading(false);
};

//
//
// APIから取得したデータをローカルストレージに追加更新する関数
/*** @name updateLsData
 *   @function arrow
 *   @param regLsData:LsPokemon[](登録するオブジェクト配列)
 *   @return void
 */
const updateLsData = (regLsData: LsPokemon[]): void => {
  // 引数を文字列json化してローカルストレージのデータに上書き
  const setPokemonDataJson = JSON.stringify(regLsData);
  localStorage.setItem('pokemonData', setPokemonDataJson);

  // 今回のポケモンデータ数を文字列に変換してローカルストレージに格納
  localStorage.setItem('pokeRegCount', regLsData.length.toString());
};


//
//
// APIから取得した大元の自然遭遇バージョン情報を整理する関数
/*** @name formatEncountVersion
 *   @function arrow
 *   @param apiData:EncountVersion[]
 *   @return number[] : 登場バージョンID
 */

const formatEncountVersion = (apiData: EncountVersion[]): number[] => {
  // データ ＞ version_details[] ＞version（目標オブジェクト）
  // version_detailsが配列
  //  ⇒version情報のみmapで取り出し、flatMapで1次元配列化
   
  // 1. version_detailsの情報だけ抽出
  const version_details: VersionDetailInner[] = apiData
    .map(arrayApiData => arrayApiData.version_details)
    .flat();  // 二重配列にならないよう平坦化（一次元配列化）（※flatMapだとmapとfilterを同時に行える）
  
  // 2. version_details からversion情報のみ抽出
  //     ※抽出条件（filter）ではなく新規配列(map)作成
  const versions: NameAndURL[] = version_details.map(versionDetail => versionDetail.version)

  // 重複データ削除
  //  元データに影響を及ぼさないよう、新たな配列を生成して処理
  //  Mapのキーにはオブジェクトは使用できないため、[name, name]のように nameだけをキーにしている
  const uniqueVersions: NameAndURL[] = Array.from(new Map(versions.map(version => [version.name, version])).values())
  
  // uniqueVersionsからバージョンIDだけを抽出
  const versionIds: number[] = getEndID(uniqueVersions)
  
  // idをグローバル版から日本版に置き換え
  const convertedJapaneseId: number[] = versionIds.flatMap(convertVersionIdToJapan)
  
  // 昇順にソート
  const sortedJapaneseId: number[] = [...convertedJapaneseId].sort((idA, idB) => idA - idB)

  // 最終的な値を返す
  return sortedJapaneseId;

}