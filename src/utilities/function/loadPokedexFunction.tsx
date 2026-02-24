import { err, ok, Result } from 'neverthrow';

import type { PokedexData } from '../types/typesUtility';
import type {
  FetchError,
  OthersAll,
  PokedexDetail,
  RegionDetail,
  VersionDetail,
  VersionGroupDetail,
} from '../types/typesFetch';

import { fetchInitialData } from './fetchPokemon';
import {
  getEndID,
  getJaData,
  getLsData,
  storageAvailable,
} from './utilityFunction';
import { getPokemonData } from './loadPokemonFunction';

/***  処理記述 ***/

// 画面初回ロード時に行うメイン処理
/*** @name loadPokedexProcess
 *   @function arrow, async/await
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return void
 *  ・図鑑・バージョン情報の取得
 */

export const loadPokedexProcess = async (
  signal: AbortSignal,
): Promise<PokedexData[]> => {
  // 図鑑・バージョン情報のURL
  const pokedexURL: string =
    'https://pokeapi.co/api/v2/version?offset=0&limit=500';

  // Pokedexにの最新状況（数値）を取得
  const currentVersionApiResult: Result<OthersAll, FetchError> =
    await fetchInitialData<OthersAll>(pokedexURL, signal);

  // 一連のfetch中のエラーここで最終処理
  if (currentVersionApiResult.isErr()) {
    // エラーの場合throwして終了
    throw currentVersionApiResult.error; // App.tsx側でcatchしてrefetch
  }

  // LSのバージョン数を取得
  const currentLsPokedexCount = Number(localStorage.getItem('pokeVerCount'));

  // 取得データの最終結果を入れるための変数
  let finalData: PokedexData[] = [];

  // ローカルストレージに図鑑情報あるか確認
  if (
    storageAvailable('localStorage') &&
    localStorage.getItem('pokedex') &&
    currentVersionApiResult.value.count === currentLsPokedexCount
  ) {
    // ローカルストレージが使える
    // 既存図鑑データがある
    // 既存データと保存数値が同じ
    //
    // LSからデータ取ってきて変数getLsResultに格納
    const getLsResult: Result<PokedexData[], FetchError> =
      getLsData<PokedexData>('pokedex');

    // 成功時⇒結果を変数に格納
    if (getLsResult.isOk()) {
      finalData = getLsResult.value;
    } else {
      // 失敗時⇒エラーを投げる
      throw getLsResult.error; // App.tsx側でcatchしてrefetch
    }
  } else {
    // 図鑑データがない or 数不一致

    // 図鑑・バージョン情報取得
    // await で中身の各種fetchがそれぞれ終わるの待つ
    const getResult: Result<
      [RegionDetail[], PokedexDetail[], VersionDetail[], VersionGroupDetail[]],
      FetchError
    > = await getAllInfo(signal);

    // エラーの場合終了してreturn
    if (getResult.isErr()) {
      throw getResult.error; // App.tsx側でcatchしてrefetch
    }

    // 以下成功時処理
    const normalizeResult: Result<PokedexData[], never> =
      await buildRegionInfoData(
        getResult.value[0], // regions
        getResult.value[1], // pokedexes
        getResult.value[2], // versions
        getResult.value[3], // versionGroups
      );

    // エラーの場合終了してreturn
    if (normalizeResult.isErr()) {
      throw normalizeResult.error; // App.tsx側でcatchしてrefetch
    }

    // 成功時⇒結果を変数に格納
    finalData = normalizeResult.value;

    // LSが使えるなら情報保存
    if (storageAvailable('localStorage')) {
      // バージョン数を保存
      localStorage.setItem(
        'pokeVerCount',
        currentVersionApiResult.value.count.toString(),
      );

      // console.log({ pokedexData });
      // 図鑑情報を文字列化して保存
      localStorage.setItem('pokedex', JSON.stringify(finalData));
    }
  }

  return finalData; // LS保存まで終わったらqueryFnに返す
};

//
/* サブ関数 */

// 地方関連の情報を取得・統合加工
/*** @name getAllInfo
 *   @function arrow, async/await
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return void
 */
const getAllInfo = async (
  signal: AbortSignal,
): Promise<
  Result<
    [RegionDetail[], PokedexDetail[], VersionDetail[], VersionGroupDetail[]],
    FetchError
  >
> => {
  // 各種情報取得を並行処理・全て終わるのを待つ（Promise.all）
  const allResult = await Promise.all([
    getEachInfo<RegionDetail>('region', signal), // 地方
    getEachInfo<PokedexDetail>('pokedex', signal), // 地方図鑑
    getEachInfo<VersionDetail>('version', signal), // バージョン
    getEachInfo<VersionGroupDetail>('version-group', signal), // バージョングループ
  ]);

  // allResultに配列として格納された結果データを統合
  return Result.combine(allResult);
};

//
//
// 情報をfetchで取ってくる中間処理
/*** @name getEachInfo
 *   @function async/await
 *   @param endPoint:string 検索先指定
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise
 */
async function getEachInfo<T>(
  endPoint: string,
  signal: AbortSignal,
): Promise<Result<T[], FetchError>> {
  // 対象情報の全体数取得
  const getInfoResult: Result<OthersAll, FetchError> =
    await fetchInitialData<OthersAll>(
      `https://pokeapi.co/api/v2/${endPoint}/?offset=0&limit=500`,
      signal,
    );

  // リスト取得失敗時のハンドリング
  if (getInfoResult.isErr()) {
    return err(getInfoResult.error); // エラーだから返して終了
  }
  console.log({ getInfoResult });

  // IDリスト抽出
  const searchNum: number[] = getEndID(getInfoResult.value.results);

  const infoDetails: Result<T[], FetchError> = await getPokemonData<T>(
    searchNum,
    endPoint,
    signal,
  );

  // エラー処理
  if (infoDetails.isErr()) {
    // 画面にエラー内容表示
    return err(infoDetails.error); // エラーだから返して終了
  }

  return ok(infoDetails.value);
}

//
//
// fetchで取ってきた情報を加工
/*** @name getEachInfo
 *   @function async/await
 *   @param endPoint:string 検索先指定
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise
 */
async function buildRegionInfoData(
  regions: RegionDetail[],
  pokedexes: PokedexDetail[],
  versions: VersionDetail[],
  versionGroups: VersionGroupDetail[],
): Promise<Result<PokedexData[], never>> {
  // 各情報を並列して整理
  const allTransformResult = await Promise.all([
    /* ok()でPromiseの箱に格納⇒Promise.allで簡単に処理できる */

    // pokedexを日本語名で必要情報を整理
    ok(transformPokedex(pokedexes)),

    // regionを日本語で整理
    ok(transformRegion(regions)),

    // versionを日本語で整理
    ok(transformVersion(versions)),

    // version-groupを日本語で整理
    ok(transformVersionGroup(versionGroups)),
  ]);
  // 4関数の結果を引数に統合関数に渡して親関数に返す
  return Result.combine(allTransformResult).map(
    ([
      transformPokedex,
      transformRegion,
      transformVersion,
      transformVersionGroup,
    ]) => {
      console.log({ transformPokedex });
      console.log({ transformRegion });
      console.log({ transformVersion });
      console.log({ transformVersionGroup });
      // PokedexData型配列を返す
      return normalizeInfo(
        transformPokedex,
        transformRegion,
        transformVersion,
        transformVersionGroup,
      );
    },
  );
}

// 地方図鑑の情報加工
interface TfPokedex {
  id: number;
  isMain: boolean;
  name: string;
  region: number;
  vGroup: number[];
}
const transformPokedex = (pokedexes: PokedexDetail[]): TfPokedex[] => {
  // filter + map ⇒flatMap
  const result: TfPokedex[] = pokedexes.flatMap((pokedex) => {
    if (pokedex.name === 'national') return []; // flatMapのfilter部分の機能でreturn時に弾ける

    const id: number = pokedex.id;
    const isMain: boolean = pokedex.is_main_series;

    const tmpName: PokedexDetail['names'] = getJaData(pokedex.names);
    const name: string =
      tmpName && tmpName.length > 0 ? tmpName[0].name : pokedex.name;

    const region: number = getEndID([pokedex.region])[0];
    const vGroup: number[] = getEndID(pokedex.version_groups);

    return {
      id,
      isMain,
      name,
      region,
      vGroup,
    };
  });

  // id順に並べ替えてから返す
  return [...result].sort((a, b) => a.id - b.id);
};

// 地方情報加工
interface TfRegion {
  id: number;
  mainGeneration: number;
  name: string;
  pokedex: number[];
  vGroup: number[];
}
const transformRegion = (regions: RegionDetail[]): TfRegion[] => {
  const result: TfRegion[] = regions.map((region) => {
    const id: number = region.id;
    const mainGeneration = getEndID([region.main_generation])[0];
    const tmpName: RegionDetail['names'] = getJaData(region.names);
    const name: string =
      tmpName && tmpName.length > 0 ? tmpName[0].name : region.name;
    const pokedex = getEndID(region.pokedexes);
    const vGroup: number[] = getEndID(region.version_groups);

    return {
      id,
      mainGeneration,
      name,
      pokedex,
      vGroup,
    };
  });

  // id順に並べ替えてから返す
  return [...result].sort((a, b) => a.id - b.id);
};

// バージョン情報加工
interface TfVersion {
  id: number;
  name: string;
  vGroup: number[];
}
const transformVersion = (versions: VersionDetail[]): TfVersion[] => {
  const result: TfVersion[] = versions.map((version) => {
    const id: number = version.id;
    const tmpName: RegionDetail['names'] = getJaData(version.names);
    const name: string =
      tmpName && tmpName.length > 0 ? tmpName[0].name : version.name;
    const vGroup: number[] = getEndID([version.version_groups]);

    return {
      id,
      name,
      vGroup,
    };
  });

  // id順に並べ替えてから返す
  return [...result].sort((a, b) => a.id - b.id);
};

// バージョングループ情報加工
interface TfVG {
  id: number;
  generation: number;
  version: number[];
}
const transformVersionGroup = (versionGroups: VersionGroupDetail[]): TfVG[] => {
  const result: TfVG[] = versionGroups.map((vgroup) => {
    const id: number = vgroup.id;
    const generation: number = getEndID([vgroup.generation])[0];
    const version: number[] = getEndID(vgroup.versions);

    return {
      id,
      generation,
      version,
    };
  });

  // id順に並べ替えてから返す
  return [...result].sort((a, b) => a.id - b.id);
};

// 統合
const normalizeInfo = (
  tPokedex: TfPokedex[],
  tRegion: TfRegion[],
  tVersion: TfVersion[],
  tVersionGroup: TfVG[],
): PokedexData[] => {
  // pokedexを基準にPokedexData型オブジェクト配列を生成・返す
  return tPokedex.flatMap((pokedex) => {
    //region情報
    const targetRegion = tRegion.find((region) => region.id === pokedex.region); // 「末尾!」でundefinedにはならないことを断言
    if (!targetRegion) return []; // flatMapの機能で削除できる

    // バージョングループ情報
    const targetVGs: TfVG[] = pokedex.vGroup
      .map((vg) => {
        return tVersionGroup.find((tVG) => tVG.id === vg);
      })
      // returnの結果からundefinedを弾く（undefinedがないことを宣言）
      .filter(
        (
          vgFound,
        ): vgFound is { id: number; generation: number; version: number[] } =>
          vgFound !== undefined,
      );
    // vgFound:findでヒットしたvGroupの要素（filterにかける対象）
    // 「=> vgFound !== undefined」判定。true/false
    // 「: vgFound is {型}」: => 以降の判定がtrueなら、vgFoundは{型}で確定（型アサーション）

    // オブジェクトに詰めてtPokedex基準のmapの結果として返す
    return {
      id: pokedex.id,
      name: pokedex.name,
      isMain: pokedex.isMain,
      region: {
        id: targetRegion.id,
        name: targetRegion.name,
        mainGene: targetRegion.mainGeneration,
      },
      vGroup: normalizeVersionAndVgroup(targetVGs, tVersion), // targetVersionの戻り値がそのままオブジェクトになる
    };
  });
};

// バージョングループに含まれるバージョンの情報を取得・格納
const normalizeVersionAndVgroup = (
  targetVGs: TfVG[],
  tVersion: TfVersion[],
): PokedexData['vGroup'] => {
  // 1. 取得したバージョングループ情報の配列を回す
  return targetVGs.map((vgObj) => {
    // 2. vgObj内のversion[]を回す
    const versionInfo = vgObj.version
      .map((verNum: number) => {
        // 各周回の対象となるのはverNum単体
        // ⇒verNumとidが一致するバージョン情報を探す
        const matchVersion = tVersion.find((vObj) => vObj.id === verNum);

        // 後続処理のために存在を確定させる
        if (!matchVersion) return null;

        // 情報を詰めて返す
        return {
          id: matchVersion.id, // 末尾に!で存在断言
          name: matchVersion.name,
          generation: vgObj.generation,
        };
      })
      // returnの結果からnullを除外
      .filter(
        (matchIdObj): matchIdObj is NonNullable<typeof matchIdObj> =>
          matchIdObj !== null,
      );

    // 必要な情報を必要な形式に詰める
    // バージョングループ情報ごと詰める
    return {
      id: vgObj.id,
      version: versionInfo,
    };
  });
};
