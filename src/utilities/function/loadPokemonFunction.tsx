/* 各種APIからポケモン情報を取得する機能 */

/* 各種機能記述ファイル */

/* 設定・導入 */
import type { RefObject } from 'react';
import { ok, type Result, type ResultAsync } from 'neverthrow'; // 非同期処理用ライブラリ

import type {
  FetchError,
  PokemonListResponse,
  PokemonDetail,
  PokemonSpeciesDetail,
  FormsDetail,
} from '../types/typesFetch'; // PokemonListResponse型を使用（type{型}）
import type {
  setBoolean,
  LsPokemon,
  PokedexNumber,
  setPokemonAllData,
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
} from './utilityFunction';
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
  3-2. 最初の30件のデータを取得
  3-3. 表示用データを画面に表示
  3-4. バックグラウンドで残りのデータを取得・格納
*/
export const loadPokemonProcess = async (
  initialURL: string,
  pokemonAllData: LsPokemon[],
  setPokemonAllData: setPokemonAllData,
  setIsLoading: setBoolean,
  isBgLoading: RefObject<boolean>,
  signal: AbortSignal,
) => {
  // 一度に取得するAPIの数
  const getAPIcount: number = 1;

  /* どのルートでも最新のフロントAPIを一度叩く */
  //
  // fetchInitialDataでAPIの最新状況を取得する
  const nowFetchResult: Result<PokemonListResponse, FetchError> =
    await fetchInitialData<PokemonListResponse>(initialURL, signal);

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
  const currentLsCount = Number(localStorage.getItem('pokeRegCount'));

  console.log('LS: ' + storageAvailable('localStorage'));
  console.log(localStorage.getItem('pokeRegCount'));
  console.log(currentLsCount === nowFetchResult.value.count);

  if (
    storageAvailable('localStorage') &&
    localStorage.getItem('pokeRegCount') &&
    currentLsCount === nowFetchResult.value.count
  ) {
    // ・ローカルストレージが使える
    // ・ローカルストレージに既存データがある
    // ・ローカルストレージのデータ数とAPIのデータ数が同じ
    // ⇒LSに登録済みのデータを使う
    getLsData<LsPokemon>(setPokemonAllData, 'pokemonData');

    // 各種判定フラグを変更
    isContinue = false; // fetchの追加処理は不要
    isBgLoading.current = false; // バックグラウンド取得もしない
  } else {
    // 上記３点を１つでも満たさない
    // ⇒APIからデータを取ってくる
    // 時間がかかる処理なので終わるまで次に進めない(await)
    await getNowPokemonData(
      pokedexNumArray,
      pokemonAllData,
      setPokemonAllData,
      currentLsCount,
      30,
      signal,
    );
  }

  // ローディング画面解除
  setIsLoading(false);

  // fetch処理継続
  if (isContinue) {
    // バックグラウンドで行う＝同期処理＝awaitつけない
    backgroundFetchAPI(
      pokedexNumArray,
      getAPIcount,
      pokemonAllData,
      setPokemonAllData,
      isBgLoading,
      signal,
    );
  }
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
const getNowPokemonData = async (
  pokedexNumArray: number[],
  pokemonAllData: LsPokemon[],
  setPokemonAllData: setPokemonAllData,
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
    // 画面にエラー内容表示
    alertError(pokemonDetails);
    return; // 関数実行終了
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

  // ※matchで成否の処理後なので、全て成功後の型として扱う
  // 3つのAPIから取得した情報でオブジェクトの配列をつくる
  // createBaseDataが確実に終わってからローカルストレージの更新
  const regLsData: LsPokemon[] = await createBaseData(
    pokemonDetails.value,
    pokemonSpecies,
    pokemonForm,
    runNumbers,
  );

  if (storageAvailable('localStorage')) {
    // ローカルストレージのデータを更新する
    console.log('updateLsData');
    updateLsData(regLsData, setPokemonAllData);
  } else {
    // ローカルストレージが使用できない場合はメモリで管理
    console.log('addDataToMemory');
    addDataToMemory(regLsData, pokemonAllData, setPokemonAllData);
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
export async function getPokemonData<T>(
  runPokedexNumbers: number[],
  endPoint: string,
  signal: AbortSignal,
): Promise<ResultAsync<T[], FetchError>> {
  const pokemonDetailResults: Result<T[], FetchError> = await getPokemonDetail(
    runPokedexNumbers,
    endPoint,
    signal,
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
): LsPokemon[] => {
  return runNumbers.map((num: number) => {
    // 管理番号(num)に一致するpokemonDetailsのデータを取得
    const numPokemonDetail: PokemonDetail | undefined = pokemonDetails.find(
      (detail) => detail.id === num,
    );

    // 管理番号(num)に一致するpokemonSpeciesのデータを取得
    const numPokemonSpecies: PokemonSpeciesDetail | undefined =
      pokemonSpecies.find((species) => {
        if (numPokemonDetail !== undefined) {
          // numPokemonDetailを正常に取得
          // ⇒numPokemonDetailのspeciesと一致するspecies.idを返す
          return species.id === getEndID([numPokemonDetail.species])[0];
        } else {
          return undefined;
        }
      });

    // 管理番号(num)に一致するpokemonFormのデータを取得
    const numPokemonForm: FormsDetail | undefined = pokemonForm.find((form) => {
      if (numPokemonDetail !== undefined) {
        // numPokemonDetailを正常に取得
        // ⇒numPokemonDetailのspeciesと一致するspecies.idを返す
        return form.id === getEndID(numPokemonDetail.forms)[0];
      } else {
        return undefined;
      }
    });

    // オブジェクトに詰める情報の変数宣言
    let setName: LsPokemon['name'] = null;
    let setType: LsPokemon['type'] = [0];
    let setPokedex: LsPokemon['pokedex'] = 0 as PokedexNumber;
    let setSpecies: LsPokemon['sp'] = 0;
    let setRegion: LsPokemon['region'] = [0];
    let setGeneration: LsPokemon['ge'] = 0;
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
      if (!numPokemonDetail.sprites.front_shiny) {
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
  getAPIcount: number,
  pokemonAllData: LsPokemon[],
  setPokemonAllData: setPokemonAllData,
  isBgLoading: RefObject<boolean>,
  signal: AbortSignal,
): Promise<void> => {
  const startNum: number = 0 + getAPIcount; // ローディングの裏で取得した分の続きから開始

  for (
    let i: number = startNum;
    i <= pokedexNumArray.length - startNum;
    i += getAPIcount
  ) {
    await getNowPokemonData(
      pokedexNumArray,
      pokemonAllData,
      setPokemonAllData,
      i,
      getAPIcount,
      signal,
    );
  }
  console.log('backgroundFetchAPI finished');
  isBgLoading.current = false;
};

//
//
// APIから取得したデータをローカルストレージに追加更新する関数
/*** @name updateLsData
 *   @function arrow
 *   @param regLsData:LsPokemon[](登録するオブジェクト配列)
 *   @param setPokemonAllData:setPokemonAllData(APIデータを取得加工後の箱)
 *   @return void
 */
const updateLsData = (
  regLsData: LsPokemon[],
  setPokemonAllData: setPokemonAllData,
): void => {
  // ローカルストレージの既存データを取得
  const currentLsData = localStorage.getItem('pokemonData');

  // 既存データがあればJSON変換
  // 無い：「成功」の空配列（ok<LsPokemon[], FetchError>([])）を返す
  const pokemonDataResult: Result<LsPokemon[], FetchError> = currentLsData
    ? parseJsonBody<LsPokemon[]>(currentLsData, 'localStorage:pokemonData')
    : ok<LsPokemon[], FetchError>([]);

  // 失敗しててもok([])の結果を返す
  // 成功してたらResult<LsPokemon[]の結果を取り出して（unwrapOr）渡す
  const currentLsDataJSON: LsPokemon[] = pokemonDataResult.unwrapOr([]);

  pokemonDataResult.match(
    (pokemonData: LsPokemon[]) => {
      console.log('Jsonパース成功', pokemonData);

      // 既存のデータに対し結合・ソート・一意化
      const mergeAndSortJson = mergeAndUniqueById(currentLsDataJSON, regLsData);

      // マージ結果をアプリ内で使用データに格納
      setPokemonAllData(mergeAndSortJson);

      // マージしたオブジェクト配列を文字列json化してローカルストレージのデータに上書き
      const setPokemonDataJson = JSON.stringify(mergeAndSortJson);
      localStorage.setItem('pokemonData', setPokemonDataJson);

      // 今回のポケモンデータ数を文字列に変換してローカルストレージに格納
      localStorage.setItem('pokeRegCount', mergeAndSortJson.length.toString());
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
const addDataToMemory = (
  regLsData: LsPokemon[],
  pokemonAllData: LsPokemon[],
  setPokemonAllData: setPokemonAllData,
): void => {
  // 現在のAPIから取得したデータと格納済みのデータを結合・id順にソートして変数に格納

  // 取得データはuseRed変数pokemonDataに格納
  const mergeAndSortJson = mergeAndUniqueById(pokemonAllData, regLsData);
  setPokemonAllData(mergeAndSortJson);
};
