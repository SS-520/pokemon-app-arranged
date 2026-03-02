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
  }

  // isGetAPIがfalseのまま⇒APIから取得する必要がある
  if (!isGetAPI) {
    //  一度に取得するAPIの数
    const getAPIcount: number = 30;

    // 時間がかかる処理なので終わるまで次に進めない(await)
    // getNowPokemonDataを5セット150匹取得
    for (let i = 0; i < 5; i++) {
      // 取得済み＋（取得数× i周目）
      const currentStart = currentLsCount + getAPIcount * i;

      // API取得
      const newData: LsPokemon[] = await getNowPokemonData(
        pokedexNumArray,
        currentStart,
        getAPIcount,
        signal,
      );
      // 取得したnewDataデータをfinalDataにマージして格納
      finalData = mergeAndUniqueById(finalData, newData);
    }

    // 既存のローカルストレージのデータ有⇒finalDataに更にマージ
    if (lsData && lsData.isOk()) {
      finalData = mergeAndUniqueById(finalData, lsData.value);
    }

    // ローカルストレージが使える場合
    // 最終的なfinalDataをローカルストレージに保存
    if (storageAvailable('localStorage')) {
      updateLsData(finalData);
    }

    //  裏で一度に取得するAPIの数
    const getBackAPIcount: number = 30;

    // 取得済み＋（取得数×5周目=150匹）から裏処理は開始
    const nextStartNum: number = currentLsCount + getAPIcount * 5;

    // プログレスバー初期進捗
    setProgress(Math.round((nextStartNum / pokedexNumArray.length) * 100));
    // バックグラウンド処理開始
    setIsBgLoading(true);

    // 残りは裏で取得
    backgroundFetchAPI(
      pokedexNumArray,
      nextStartNum,
      getBackAPIcount,
      queryClient,
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

  // ※matchで成否の処理後なので、全て成功後の型として扱う
  // 3つのAPIから取得した情報でオブジェクトの配列を作って返す
  return await createBaseData(
    pokemonDetails.value,
    pokemonSpecies,
    pokemonForm,
    runNumbers,
  );
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
): Promise<Result<T[], FetchError>> {
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
  gotDataCount: number,
  getAPIcount: number,
  queryClient: QueryClient,
  setIsBgLoading: setBoolean,
  setProgress: setNumber,
  signal: AbortSignal,
): Promise<void> => {
  const startNum: number = gotDataCount; // ローディングの裏で取得した分の続きから開始

  for (let i: number = startNum; i < pokedexNumArray.length; i += getAPIcount) {
    // 追加データ取得
    const newData: LsPokemon[] = await getNowPokemonData(
      pokedexNumArray,
      i,
      getAPIcount,
      signal,
    );

    // 取得したデータが画面に反映されるように設定
    queryClient.setQueryData(
      ['pokemon', 'all'],
      (currentData: LsPokemon[] | undefined) => {
        // 既存データに新規データをマージ
        // currentDataがなくundefinedの場合は空配列を渡す
        const mergeData: LsPokemon[] = mergeAndUniqueById(
          currentData ?? [],
          newData,
        );
        // ローカルストレージが使えるなら保存
        if (storageAvailable('localStorage')) {
          updateLsData(mergeData);
        }

        // プログレスバーの値を更新
        setProgress(
          Math.round((mergeData.length / pokedexNumArray.length) * 100),
        );

        // 画面に反映させるためにマージしたデータを返す
        return mergeData;
      },
    );
  }
  console.log('backgroundFetchAPI finished');
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
