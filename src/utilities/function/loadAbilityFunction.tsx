// 画面初回ロード時に行うメイン処理
/*** @name loadAbilityProcess
 *   @function arrow, async/await
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return void
 *  ・特性情報の取得
 */

import type { Result } from 'neverthrow';
import type { AbilityDetail, FetchError, OthersAll } from '../types/typesFetch';
import { fetchInitialData } from './fetchPokemon';
import {
  getAllJaData,
  getEndID,
  getJaData,
  getLsData,
  storageAvailable,
} from './utilityFunction';
import type { AbilityData } from '../types/typesUtility';
import { getPokemonData } from './loadPokemonFunction';

export const loadAbilityProcess = async (signal: AbortSignal) => {
  // 特性情報のURL
  const abilityURL: string =
    'https://pokeapi.co/api/v2/ability?offset=0&limit=500';

  // 特性情報取得
  const currentAbilityApiResult: Result<OthersAll, FetchError> =
    await fetchInitialData<OthersAll>(abilityURL, signal);

  // 一連のfetch中のエラーここで最終処理
  if (currentAbilityApiResult.isErr()) {
    throw currentAbilityApiResult.error; // App.tsx側でcatchしてrefetch
  }

  // LSの特性数を取得
  const currentLsAbilityCount = Number(localStorage.getItem('abilityCount'));

  // 取得データの最終結果を入れるための変数
  let finalData: AbilityData[] = [];

  // ローカルストレージに特性情報あるか確認
  if (
    storageAvailable('localStorage') &&
    localStorage.getItem('ability') &&
    currentAbilityApiResult.value.count === currentLsAbilityCount
  ) {
    // ローカルストレージが使える
    // 既存特性データがある
    // 既存データと保存数値が同じ
    //
    // LSからデータ取ってきて変数getLsResultに格納
    const getLsResult: Result<AbilityData[], FetchError> =
      getLsData<AbilityData>('ability');

    // 成功時⇒結果を変数に格納
    if (getLsResult.isOk()) {
      finalData = getLsResult.value;
    } else {
      // 失敗時⇒エラーを投げる
      throw getLsResult.error; // App.tsx側でcatchしてrefetch
    }
  }

  // 特性データがない or 数不一致
  if (
    !localStorage.getItem('ability') ||
    currentAbilityApiResult.value.count !== currentLsAbilityCount
  ) {
    // 特性のIDリスト抽出
    const searchNum: number[] = getEndID(currentAbilityApiResult.value.results);

    // 特性取得
    const abilityDetail: Result<AbilityDetail[], FetchError> =
      await getPokemonData<AbilityDetail>(searchNum, 'ability', signal);

    // エラーの場合終了してreturn
    if (abilityDetail.isErr()) {
      throw abilityDetail.error; // App.tsx側でcatchしてrefetch
    }

    // 以下成功時処理
    const normalizeResult: AbilityData[] = await normalizeAbility(
      abilityDetail.value,
    );

    // 成功時⇒結果を変数に格納
    finalData = normalizeResult;

    // LSが使えるなら情報保存
    if (storageAvailable('localStorage')) {
      // バージョン数を保存
      localStorage.setItem(
        'abilityCount',
        currentAbilityApiResult.value.count.toString(),
      );

      // console.log({ pokedexData });
      // 図鑑情報を文字列化して保存
      localStorage.setItem('ability', JSON.stringify(finalData));
    }
  }
  return finalData; // LS保存まで終わったらqueryFnに返す
};

//
/* サブ関数 */

// 特性関連の情報を整理・加工
/*** @name normalizeAbility
 *   @function arrow
 *   @param getData:RefObject(あとでLSに詰める特性関連データ,useRef)
 *   @param abilityData:RefObject(あとでLSに詰める特性関連データ,useRef)
 *   @return void
 */
const normalizeAbility = (getData: AbilityDetail[]): AbilityData[] => {
  // 配列getDataの要素ability１つずつに加工処理
  const result: AbilityData[] = getData.map((ability) => {
    // 日本語名を取得
    console.log({ ability });
    const tmpName: AbilityDetail['names'] = getJaData(ability.names);
    console.log({ tmpName });

    // 日本語テキストとバージョングループidを取得
    const tmpTextObj: { flavor_text: string; id: number[] }[] = getAllJaData(
      ability.flavor_text_entries,
    );

    // 型を一致させるためにもう一度map処理（共通関数はそのまま）
    const textObj = tmpTextObj.map((obj) => {
      //オブジェクトの要素名を再定義
      return {
        flavor_text: obj.flavor_text,
        version_group: obj.id,
      };
    });

    return {
      id: ability.id,
      name: tmpName.length > 0 ? tmpName[0].name : ability.name,
      flavor_text_entries: textObj,
    };
  });

  return result;
};
