/* 各種機能記述ファイル */

/* 設定・導入 */
import type { RefObject } from 'react';
import { ok, type Result, type ResultAsync } from 'neverthrow'; // 非同期処理用ライブラリ
import type { FetchError, PokemonListResponse, PokemonDetail, PokemonSpeciesDetail } from '../types/typesFetch'; // PokemonListResponse型を使用（type{型}）
import type { setBoolean, LsPokemon, PokedexNumber } from '../types/typesUtility';
import { getNowAPI, getPokemonDetail } from './fetchPokemon'; // fetchPokemonから各関数を呼び出し
import { storageAvailable, getEndID, getNationalData, getJaData, getPokedexNumber, getDisplayImg, createNullSpecies, mergeAndUniqueById } from './utilityFunction';
import { parseJsonBody, alertError } from './fetchFunction';

/***  処理記述 ***/

// 画面初回ロード時に行うメイン処理
/*** @name loadProcess
 *   @function arrow, async/await
 *   @param initialURL:string(ポケモンAPI)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @param setIsLoading:setBoolean(ローディング判定,useState)
 *   @param isBgLoading:RefObject(バックグラウンドのローディング判定,useRef)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return void
 * 
  1. fetchで更新があるか確認

  2-1. 更新がない
  2-2. ローカルストレージから表示用のデータを取得
  2-3. 取得したデータを画面に表示

  3-1. 更新がある
  3-2. 最初の50件のデータを取得
  3-3. 表示用データを画面に表示
  3-4. バックグラウンドで残りのデータを50件ずつ取得・格納
*/
export const loadProcess = async (initialURL: string, refPokemonData: RefObject<LsPokemon[]>, setIsLoading: setBoolean, isBgLoading: RefObject<boolean>, signal: AbortSignal) => {
  // 一度に取得するAPIの数
  const getAPIcount: number = 1;

  /* どのルートでも最新のフロントAPIを一度叩く */
  //
  // firstDataCheckでAPIの最新状況を取得する
  const nowFetchResult: Result<PokemonListResponse, FetchError> = await firstDataCheck(initialURL, signal);

  // 一連のfetch中のエラーここで最終処理
  if (nowFetchResult.isErr()) {
    // 画面にエラー内容表示
    alertError(nowFetchResult);
    return; // 関数実行終了
  }

  // APIの結果から最新の全国図鑑の番号を切り出し・取得
  const pokedexNumArray: number[] = getEndID(nowFetchResult.value.results);

  // バックグラウンド処理に移行するかのフラグ
  let isContinue = true;
  const currentLsCount = Number(localStorage.getItem('pokeRegNum'));

  console.log('LS: ' + storageAvailable('localStorage'));
  console.log(localStorage.getItem('pokeRegNum'));
  console.log(currentLsCount === nowFetchResult.value.count);

  if (storageAvailable('localStorage') && localStorage.getItem('pokeRegNum') && currentLsCount === nowFetchResult.value.count) {
    // ・ローカルストレージが使える
    // ・ローカルストレージに既存データがある
    // ・ローカルストレージのデータ数とAPIのデータ数が同じ
    // ⇒LSに登録済みのデータを使う
    getLsData(refPokemonData);

    // 各種判定フラグを変更
    isContinue = false; // fetchの追加処理は不要
    isBgLoading.current = false; // バックグラウンド取得もしない
  } else {
    // 上記３点を１つでも満たさない
    // ⇒APIからデータを取ってくる
    // 時間がかかる処理なので終わるまで次に進めない(await)
    await getNowPokemonData(pokedexNumArray, refPokemonData, currentLsCount, 20, signal);
  }

  // ローディング画面解除
  setIsLoading(false);

  // fetch処理継続
  if (isContinue) {
    // バックグラウンドで行う＝同期処理＝awaitつけない
    backgroundFetchAPI(pokedexNumArray, getAPIcount, refPokemonData, isBgLoading, signal);
  }
};

//
//
// fetchで更新があるか確認
/*** @name loadProcess
 *   @function arrow, async/await
 *   @param initialURL:string(ポケモンAPI)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<number>
 *
 */
const firstDataCheck = async (initialURL: string, signal: AbortSignal): Promise<ResultAsync<PokemonListResponse, FetchError>> => {
  // ポケモンAPIからカウントを取得
  const nowApiResult: Result<PokemonListResponse, FetchError> = await getNowAPI(initialURL, signal);

  // 一連のfetch中にエラー発生⇒先に戻す
  if (nowApiResult.isErr()) {
    const fetchError: FetchError = nowApiResult.error;
    console.error(`[データ取得失敗] エラータイプ: ${fetchError.type}`, fetchError);

    return nowApiResult; // Errが返る
  }

  // 正常終了時⇒呼び出し元の処理を進める
  return ok(nowApiResult.value);
};

//
//
// 最新のポケモン情報を取得する一式
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
const getNowPokemonData = async (pokedexNumArray: number[], refPokemonData: RefObject<LsPokemon[]>, start: number, run: number, signal: AbortSignal) => {
  // 処理する範囲を指定
  const runNumbers: number[] = pokedexNumArray.slice(start, start + run);

  // ⇒ポケモンAPIから最新データを取得（基本情報）
  const pokemonDetails: Result<PokemonDetail[], FetchError> = await getPokemonData<PokemonDetail>(runNumbers, 'pokemon', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonDetails.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonDetails);
    return; // 関数実行終了
  }

  // 取得した結果から種類（species）番号を取得
  const tmpSpeciesNum: number[] = getSpeciesNumber(pokemonDetails.value);

  // ⇒ポケモンAPIから最新データを取得（種類別情報）
  const pokemonSpeciesResult: Result<PokemonSpeciesDetail[], FetchError> = await getPokemonData<PokemonSpeciesDetail>(tmpSpeciesNum, 'pokemon-species', signal);

  // species未登録データもある
  // ⇒404で返ってくることもあるのでエラーでも後続処理続行
  const pokemonSpecies: PokemonSpeciesDetail[] = pokemonSpeciesResult.match(
    (successData) => successData, // 成功時はそのままデータ保持
    (resultError) => {
      // 該当番号のPokemonSpeciesDetail型をnullで埋めたデータを返す
      console.warn(`id:${tmpSpeciesNum}, species未登録。${resultError.status}`);
      return tmpSpeciesNum.map((id): PokemonSpeciesDetail => createNullSpecies(id));
    },
  );

  // ※matchで成否の処理後なので、全て成功後のPokemonSpeciesDetail型として扱う
  // 2つのAPIから取得した情報でオブジェクトの配列をつくる
  // createBaseDataが確実に終わってからローカルストレージの更新
  const regLsData: LsPokemon[] = createBaseData(pokemonDetails.value, pokemonSpecies, runNumbers);

  if (storageAvailable('localStorage')) {
    // ローカルストレージのデータを更新する
    console.log('updateLsData');
    updateLsData(regLsData, refPokemonData);
  } else {
    // ローカルストレージが使用できない場合はメモリで管理
    console.log('addDataToMemory');
    addDataToMemory(regLsData, refPokemonData);
  }
};

//
//
// ポケモン個別APIで詳細データを取得する
/*** @name getPokemonData
 *   @function async/await
 *   @param runPokedexNumbers[]:number[](全国図鑑の番号)
 *   @param endPoint:string(実行先APIのURLのパーツ)
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<ResultAsync<PokemonDetail[], FetchError>>
 *  ・詳細データの取得
 */
export async function getPokemonData<T>(runPokedexNumbers: number[], endPoint: string, signal: AbortSignal): Promise<ResultAsync<T[], FetchError>> {
  const pokemonDetailResults: Result<T[], FetchError> = await getPokemonDetail(runPokedexNumbers, endPoint, signal);
  // 一連のfetch中にエラー発生⇒先に戻す
  if (pokemonDetailResults.isErr()) {
    const fetchError: FetchError = pokemonDetailResults.error;
    console.error(`[データ取得失敗] エラータイプ: ${fetchError.type}`, fetchError);

    return pokemonDetailResults; // Errが返る
  }

  return pokemonDetailResults;
}

//
//
// ポケモン個別APIから取得したデータを基にspecies情報検索番号を取得
/*** @name getSpeciesNumber
 *   @function arrow
 *   @param PokemonDetail[]:PokemonDetail[](基本データの配列)
 *   @return number[]
 */
const getSpeciesNumber = (array: PokemonDetail[]): number[] => {
  const speciesNumbers: number[] = array.map((pokemonDetail) => {
    return getEndID([pokemonDetail.species])[0];
    // getEndIDの戻り値は配列
    // ⇒speciesNumbers(配列)の中に配列を入れるのを防ぐ
    // ⇒index0の要素を取り出してspeciesNumbersという配列に格納
  });
  return speciesNumbers;
};

//
//
// ポケモン個別APIから取得したデータを基に表示・検索・保存に使うデータを整形
/*** @name createBaseData
 *   @function arrow
 *   @param pokemonDetails[]:PokemonDetail[](基本データの配列)
 *   @param pokemonSpecies[]:PokemonSpeciesDetail[](固有データの配列)
 *   @param runNumbers[]:number[](対象の管理番号配列)
 *   @return Promise<ResultAsync<PokemonDetail[], FetchError>>
 *  ・id:number(管理番号)
 *  ・name:string(名前)
 *  ・type:number[](タイプ番号)
 *  ・pokedex:PokedexNumber(全国図鑑番号)
 *  ・gene:number(初出世代)
 *  ・isGen:number(オスメス差分の有無) Number(boolean)で数値化
 *  ・egg:number[](卵グループ)
 */
const createBaseData = (pokemonDetails: PokemonDetail[], pokemonSpecies: PokemonSpeciesDetail[], runNumbers: number[]): LsPokemon[] => {
  return runNumbers.map((num: number) => {
    // 管理番号(num)に一致するpokemonDetailsのデータを取得
    const numPokemonDetail: PokemonDetail | undefined = pokemonDetails.find((detail) => detail.id === num);
    // 管理番号(num)に一致するpokemonSpeciesのデータを取得
    const numPokemonSpecies: PokemonSpeciesDetail | undefined = pokemonSpecies.find((species) => {
      if (numPokemonDetail !== undefined) {
        // numPokemonDetailを正常に取得
        // ⇒numPokemonDetailのspeciesと一致するspecies.idを返す
        return species.id === getEndID([numPokemonDetail.species])[0];
      } else {
        return undefined;
      }
    });

    // オブジェクトに詰める情報の変数宣言
    let setName: LsPokemon['name'] = null;
    let setType: LsPokemon['type'] = null;
    let setPokedex: LsPokemon['pokedex'] = null;
    let setSpecies: LsPokemon['sp'] = null;
    let setRegion: LsPokemon['region'] = null;
    let setGeneration: LsPokemon['ge'] = null;
    let setIsGender: LsPokemon['isGen'] = null;
    let setEgg: LsPokemon['egg'] = null;
    let setImg: LsPokemon['img'] = null;
    let setDifNm: LsPokemon['difNm'] = null;

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

      // フォルムチェンジなど、特殊姿の場合
      if (!numPokemonDetail.is_default) {
        setDifNm = numPokemonDetail.name;
      }
    }

    // PokemonSpeciesDetailの情報を詰める用に加工
    if (numPokemonSpecies) {
      // 管理番号と一致するPokemonSpeciesDetailがある

      // 日本語名前を取得
      // PokemonSpeciesDetail['names']が配列定義なので配列のまま処理
      const tmpName: PokemonSpeciesDetail['names'] = getJaData(numPokemonSpecies.names);

      // オプショナルチェイニング記法も有だが手堅い三項演算子で処理
      setName = tmpName && tmpName.length > 0 ? tmpName[0].name : null; // tmpNameは配列扱い＝index:0を指定
      console.log({ setName });

      // 全国図鑑番号を取得
      const tmpPokedex: PokemonSpeciesDetail['pokedex_numbers'] = getNationalData(numPokemonSpecies.pokedex_numbers);
      // 数値を取り出して型変換
      setPokedex = tmpPokedex[0].entry_number as PokedexNumber;

      // Speciesの値を詰める
      setSpecies = numPokemonSpecies.id;

      // 登場する図鑑（全国図鑑を除く）
      setRegion = getPokedexNumber(numPokemonSpecies.pokedex_numbers);

      // 初出世代
      setGeneration = getEndID([numPokemonSpecies.generation]);

      // オスメス差分の有無取得
      setIsGender = Number(numPokemonSpecies.has_gender_differences);

      // 卵グループ取得
      setEgg = getEndID(numPokemonSpecies.egg_groups);

      //
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
      isGen: setIsGender,
      egg: setEgg,
      img: setImg,
      difNm: setDifNm,
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
const backgroundFetchAPI = async (pokedexNumArray: number[], getAPIcount: number, refPokemonData: RefObject<LsPokemon[]>, isBgLoading: RefObject<boolean>, signal: AbortSignal): Promise<void> => {
  const startNum: number = 0 + getAPIcount; // ローディングの裏で取得した分の続きから開始

  for (let i: number = startNum; i <= pokedexNumArray.length - startNum; i += getAPIcount) {
    await getNowPokemonData(pokedexNumArray, refPokemonData, i, getAPIcount, signal);
  }
  console.log('backgroundFetchAPI finished');
  isBgLoading.current = false;
};

//
//
// ローカルストレージからデータを取得する
/*** @name getLsData
 *   @function arrow
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @return void
 */
const getLsData = (refPokemonData: RefObject<LsPokemon[]>): void => {
  // ローカルストレージの既存データを取得
  const currentLsData = localStorage.getItem('pokemonData');

  // 既存データがあればJSON変換
  // 無い：「成功」の空配列（ok<LsPokemon[], FetchError>([])）を返す
  const pokemonDataResult: Result<LsPokemon[], FetchError> = currentLsData ? parseJsonBody<LsPokemon[]>(currentLsData, 'localStorage:pokemonData') : ok<LsPokemon[], FetchError>([]);

  pokemonDataResult.match(
    (pokemonData: LsPokemon[]) => {
      console.log('Jsonパース成功');

      // 取得・JSON変換結果をアプリ内で使用データに格納
      refPokemonData.current = pokemonData;
    },
    (resultError: FetchError) => {
      // localStorage.removeItem('pokemonData');
      console.log(`Jsonパースに失敗しました。詳細は以下の通りです。
      \n通信先：${resultError.context?.url},
      \nエラータイプ：${resultError.type},
      \n通信ステータス：${resultError.status},
      \nメッセージ：${resultError.message},
      \nエラーボディ：${resultError.context?.responseSnippet}`);
    },
  );
};

//
//
// APIから取得したデータをローカルストレージに追加更新する関数
/*** @name updateLsData
 *   @function arrow
 *   @param regLsData:LsPokemon[](登録するオブジェクト配列)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @return void
 */
const updateLsData = (regLsData: LsPokemon[], refPokemonData: RefObject<LsPokemon[]>): void => {
  // ローカルストレージの既存データを取得
  const currentLsData = localStorage.getItem('pokemonData');

  // 既存データがあればJSON変換
  // 無い：「成功」の空配列（ok<LsPokemon[], FetchError>([])）を返す
  const pokemonDataResult: Result<LsPokemon[], FetchError> = currentLsData ? parseJsonBody<LsPokemon[]>(currentLsData, 'localStorage:pokemonData') : ok<LsPokemon[], FetchError>([]);

  // 失敗しててもok([])の結果を返す
  // 成功してたらResult<LsPokemon[]の結果を取り出して（unwrapOr）渡す
  const currentLsDataJSON: LsPokemon[] = pokemonDataResult.unwrapOr([]);

  pokemonDataResult.match(
    (pokemonData: LsPokemon[]) => {
      console.log('Jsonパース成功', pokemonData);

      // 既存のデータに対し結合・ソート・一意化
      const mergeAndSortJson = mergeAndUniqueById(currentLsDataJSON, regLsData);

      // マージ結果をアプリ内で使用データに格納
      refPokemonData.current = mergeAndSortJson;

      // マージしたオブジェクト配列を文字列json化してローカルストレージのデータに上書き
      const setPokemonDataJson = JSON.stringify(mergeAndSortJson);
      localStorage.setItem('pokemonData', setPokemonDataJson);

      // 今回のポケモンデータ数を文字列に変換してローカルストレージに格納
      localStorage.setItem('pokeRegNum', mergeAndSortJson.length.toString());
    },
    (resultError: FetchError) => {
      // localStorage.removeItem('pokemonData');
      console.log(`Jsonパースに失敗しました。詳細は以下の通りです。
      \n通信先：${resultError.context?.url},
      \nエラータイプ：${resultError.type},
      \n通信ステータス：${resultError.status},
      \nメッセージ：${resultError.message},
      \nエラーボディ：${resultError.context?.responseSnippet}`);
    },
  );
};

//
//
// APIから取得したデータをメモリ上に直接追加・更新する関数
// ※ローカルストレージが使用できない場合用の関数
/*** @name addDataToMemory
 *   @function arrow
 *   @param regLsData:LsPokemon[](登録するオブジェクト配列)
 *   @param refPokemonData:RefObject<LsPokemon[]>(APIデータを取得加工後の箱)
 *   @return void
 */
const addDataToMemory = (regLsData: LsPokemon[], refPokemonData: RefObject<LsPokemon[]>): void => {
  // 現在のAPIから取得したデータと格納済みのデータを結合・id順にソートして変数に格納

  // 取得データはuseRed変数pokemonDataに格納
  const mergeAndSortJson = mergeAndUniqueById(refPokemonData.current, regLsData);
  refPokemonData.current = mergeAndSortJson;
};
