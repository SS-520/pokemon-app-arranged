/**
 * 各種パーツとして使用する関数を記述するファイル
 */
import { type RefObject } from 'react';
import { ok, type Result } from 'neverthrow';

import { commonImgURL } from '../dataInfo';

import type { NameAndURL, PokemonSpeciesDetail, PokemonDetail, FetchError, AbilityDetail } from '../types/typesFetch';
import type { LsPokemon, PokedexData } from '../types/typesUtility';

import { parseJsonBody } from './fetchFunction';

/**
 * ローカル/セッションストレージが使用可能か確認する関数
 * @param type:string 確認したいストレージ名が渡される
 * @returns boolean(true:使用可能 / false:使用不可)
 */

export function storageAvailable(type: string): boolean {
  let storage: Storage | null = null;
  const storageKey = type as 'localStorage' | 'sessionStorage'; // windowが持つことが確定しているキーに限定
  try {
    storage = window[storageKey] as Storage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage !== null &&
      storage.length !== 0
    );
  }
}

//
//
// ローカルストレージからデータを取得する
/*** @name getLsData
 *   @function
 *   @param refData:RefObject<T[]> LSから取得したデータの保管先
 *   @param lsName:string 取得するLSのkey名
 *   @return void
 */
export function getLsData<T>(refData: RefObject<T[]>, lsName: string): void {
  // ローカルストレージの既存データを取得
  const currentLsData = localStorage.getItem(lsName);

  // 既存データがあればJSON変換
  // 無い：「成功」の空配列（ok<LsPokemon[], FetchError>([])）を返す
  const pokemonDataResult: Result<T[], FetchError> = currentLsData ? parseJsonBody<T[]>(currentLsData, `localStorage:${lsName}`) : ok<T[], FetchError>([]);

  pokemonDataResult.match(
    (pokemonData: T[]) => {
      console.log('Jsonパース成功');

      // 取得・JSON変換結果をアプリ内で使用データに格納
      refData.current = pokemonData;
      console.log({ refData });
    },
    (resultError: FetchError) => {
      console.log(`Jsonパースに失敗しました。詳細は以下の通りです。
      \n通信先：${resultError.context?.url},
      \nエラータイプ：${resultError.type},
      \n通信ステータス：${resultError.status},
      \nメッセージ：${resultError.message},
      \nエラーボディ：${resultError.context?.responseSnippet}`);
    },
  );
}

// ポケモンAPIのURLから末尾のID番号を取り出す
/*** @name getEndID
 *   @function
 *   @param results[]:NameAndURL[](ポケモンAPI結果の配列)
 *          他のプロパティは何であれ必ずurlプロパティを持つ（extends { url: string }）
 *   @return number[]
 */
export function getEndID<T extends { url: string }>(results: T[]): number[] {
  // results内部のurlデータに含まれる、末尾の番号を取得・numbers[]に格納する
  // ※results内のデータが多く100毎の複数チャンクに分割されているが、スルーして通常の配列処理でOK
  const endIDs: number[] = results.map((eachResult) => {
    // 「/」でURLを分割する
    if (!eachResult) return 0; // nullなら抜ける;

    // 図鑑番号＝最後１つ前の配列を取得＋数値に明示変換して返す
    const parts: string[] = eachResult.url.split('/');

    return Number(parts[parts.length - 2]);
  });

  // 配列に格納されたIDの配列を返す
  return endIDs;
}

/**
 * 配列の中から日本語のデータを取得する関数
 * @param apiArray:T[] APIから返された、languageを含む型の配列
 * @returns T[]:T型配列（null=[]で処理)
 */
export function getJaData<T extends { language: NameAndURL }>(apiArray: T[]): T[] {
  // 最後に日本語

  // 言語がjaに一致するものを返す（最優先）
  const jaData = apiArray.find((item) => item.language.name === 'ja');
  // jaが存在した時点で返す
  if (jaData) return [jaData]; // 配列形式に変換して返す

  // jaが無かったらja-Hrktに一致するものを返す（次善）
  const jaHrktData = apiArray.find((item) => item.language.name === 'ja-Hrkt');
  // jaが存在した時点で返す
  if (jaHrktData) return [jaHrktData]; // 配列形式に変換して返す

  // どちらも該当しない→空配列を返す
  return [];
}

/**
 * 配列の中から日本語のデータを全て取得する関数
 * @param apiArray:T[] APIから返された、flavor_text_entriesの配列
 * @returns T[]:T型配列（null=[]で処理)
 * ・フレーバーテキスト取得がメイン
 * AbilityDetail['flavor_text_entries'][number]⇒配列型AbilityDetail['flavor_text_entries']の配列を解除（要素だけ抜き出し）
 */

// abilityかspeciesのフレーバーテキストを使うのでユニオン型にまとめておく
// 配列型[number]⇒「その配列の中にある数値インデックスのデータ（＝要素）」
type Flavor = AbilityDetail['flavor_text_entries'][number] | PokemonSpeciesDetail['flavor_text_entries'][number];
// 関数
export function getAllJaData(apiArray: Flavor[]): { flavor_text: string; id: number[] }[] {
  // 言語がjaに一致するものを返す
  const jaData: Flavor[] = apiArray.filter((item: Flavor) => item.language.name === 'ja').filter((foundData): foundData is Flavor => foundData !== undefined);

  // 累積データ＝配列を受け取る
  const entriesResult: { flavor_text: string; id: number[] }[] = jaData.reduce(
    (accumulator: { flavor_text: string; id: number[] }[], currentData: Flavor) => {
      const fText = currentData.flavor_text.replace(/[\n]/g, '　'); // フレーバーテキストを格納＋改行を全角に変換

      // 引数の型でurlを含むオブジェクト名が分岐
      // ⇒取得元切り替え処理
      const currentProperty: NameAndURL = 'version_group' in currentData ? currentData.version_group : currentData.version;
      // version_groupがプロパティにある？ 有：変数にversion_groupを入れる 無：変数にversionを入れる

      // version_group / versionのURLから末尾の値を抽出
      const versionId: number = getEndID([currentProperty])[0];

      // 本格的にグルーピング
      // 累積データ:accumulatorに既に一致するフレーバーテキストは登録されている？
      const existData = accumulator.find((data) => data.flavor_text === fText);

      // フレーバーテキストがある
      if (existData) {
        // この周におけるversionIdがaccumulatorに未登録
        // （数値なので完全一致で判定）
        if (!existData.id.includes(versionId)) {
          // オブジェクトにversionIdを追加
          existData.id.push(versionId);
        }
      } else {
        // テキストがない⇒累積データに新規オブジェクトとして追加
        accumulator.push({
          flavor_text: fText,
          id: [versionId],
        });
      }

      // 累積データaccumulatorに、今回のaccumulatorをreturnして詰める
      return accumulator;
    },
    [] as { flavor_text: string; id: number[] }[],
    // []: 累積変数accumulatorの初期値;
    // as 型[] ⇒ この型の配列が変えるよの宣言
  );

  return entriesResult;
}

/**
 * 配列の中から全国図鑑のオブジェクトを取得する関数
 * @param apiArray:PokemonSpeciesDetail[] pokedexを含む型の配列
 * @returns PokemonSpeciesDetail[]:実質1要素だけ返す（null=[]で処理)
 */
export function getNationalData(apiArray: PokemonSpeciesDetail['pokedex_numbers']): PokemonSpeciesDetail['pokedex_numbers'] {
  // 言語がnational(全国図鑑)に一致するものを返す
  const national = apiArray.find((item) => item.pokedex.name === 'national');
  // jaが存在した時点で返す
  if (national) return [national]; // 配列形式に変換して返す

  // 該当なし→空配列を返す
  return [];
}

/**
 * 配列の中から全国図鑑の以外オブジェクトを取得する関数
 * @param apiArray:PokemonSpeciesDetail[] pokedexを含む型の配列
 * @returns PokemonSpeciesDetail[]:実質1要素だけ返す（null=[]で処理)
 */
export const getPokedexNumber = (nums: PokemonSpeciesDetail['pokedex_numbers']): number[] => {
  // 図鑑リストから全国図鑑を抜く
  const pokedexExNational: PokemonSpeciesDetail['pokedex_numbers'] = nums.filter((num) => num.pokedex.name !== 'national');

  // 全国図鑑以外の番号を取得
  const pokedex: number[] = pokedexExNational.map((obj) => {
    // pokedex.urlの末尾から番号取得
    return Number(getEndID([obj.pokedex]));
  });

  return pokedex;
};

/**
 * オブジェクトから表示可能な画像を取得する関数
 * @param obj:PokemonDetail['sprites']
 * @returns string(URLの可変部分)
 * official-artwork > home > front_default > showdown の順に確認
 */
export const getDisplayImg = (obj: PokemonDetail['sprites']): string | null => {
  // URL共通部分（切り出し部分）
  const commonURL: string = commonImgURL;

  // 1. official-artworkがあったらその時点で返す
  if (obj.other && obj.other['official-artwork'].front_default !== null) return obj.other['official-artwork'].front_default.split(commonURL)[1];

  // 2. homeがあったらその時点で返す
  if (obj.other && obj.other.home.front_default !== null) return obj.other.home.front_default?.split(commonURL)[1];

  // 3. 直下のデータがあったらその時点で返す
  if (obj.front_default !== null) return obj.front_default.split(commonURL)[1];

  // 4. gifのデータがあったら返す（最終手段）
  if (obj.other && obj.other.showdown.front_default !== null) return obj.other.showdown.front_default.split(commonURL)[1];

  // これでもないなら再帰的に掘り出す
  const firstImage: string | null = getFirstValidImage(obj.versions);

  // 本当に何もないときはnullで返す
  return firstImage ? firstImage.split(commonURL)[1] : null;
};

/**
 * オブジェクトを再帰的に探索し、最初に見つかった null でない文字列を返す
 * @param data:any  探索対象のオブジェクトや値 ※再帰的に見るので複雑化⇒大枠はanyで対応
 * @returns :{string | null} 見つかった文字列、または全て null の場合は null
 * ※再帰処理は関数宣言時のreturn型を要明示
 */
const getFirstValidImage = (data: unknown): string | null => {
  // 1. 文字列を見つけた場合（nullやundefinedでない）
  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  // 2. null または オブジェクト/配列以外は無視
  if (data === null || typeof data !== 'object') {
    return null;
  }

  // 3. 配列またはオブジェクトとして処理
  // data を Record<string, unknown> として扱うことで、どんなキーでもアクセス可能にする
  const obj = data as Record<string, unknown>;
  const keys: string[] = Object.keys(data);

  // frontデータ優先
  keys.sort((a, b) => {
    // frontを含むオブジェクトを取得
    const aHasFront = a.toLowerCase().includes('front');
    const bHasFront = b.toLowerCase().includes('front');

    // 比較・ソート
    if (aHasFront && !bHasFront) return -1;
    if (!aHasFront && bHasFront) return 1;
    return 0;
  });

  // 列挙可能なすべてのプロパティをループ
  for (const key of keys) {
    // 再帰的に中身をチェック
    const result = getFirstValidImage(obj[key]);
    if (result) return result;
  }

  // 何も見つからなければ null
  return null;
};

/**
 * 指定idのnull埋めオブジェクトを作成
 * @param apiArray:T[] APIから返された、languageを含む型の配列
 * @returns T[]:T型配列（null=[]で処理)
 */
export const createNullSpecies = (id: number): PokemonSpeciesDetail => ({
  id: id,
  base_happiness: 0,
  capture_rate: 0,
  color: {
    name: '',
    url: '',
  },
  egg_groups: [],
  evolution_chain: { url: '' },
  flavor_text_entries: [], // 配列などは空配列、それ以外はnullなど型に合わせて調整
  form_descriptions: [],
  forms_switchable: false,
  gender_rate: 0,
  genera: [
    {
      genus: '',
      language: {
        name: '',
        url: '',
      },
    },
  ],
  generation: {
    name: '',
    url: '',
  },
  growth_rate: {
    name: '',
    url: '',
  },
  habitat: null,
  has_gender_differences: false,
  hatch_counter: 0,
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  name: '',
  names: [
    {
      name: '',
      language: {
        name: '',
        url: '',
      },
    },
  ],
  order: 0,
  pokedex_numbers: [],
  shape: {
    name: '',
    url: '',
  },
  varieties: [],
});

/**
 * 2つの配列を結合＋idの昇順に並べ替え＋idの重複を削除
 * @param currentArray:LsPokemon[] 元の配列
 * @param addArray:LsPokemon[] 追加する配列
 * @returns LsPokemon[]:整理が終わった配列
 */
export const mergeAndUniqueById = (currentArray: LsPokemon[], addArray: LsPokemon[]): LsPokemon[] => {
  // 既存データに取得したデータをマージ
  // currentLsDataJSONの配列、regLsDataの配列を解体＋全て結合
  // ※「...」のスプレッド構文を使用
  // ⇒元のcurrentLsDataJSON配列を破壊せず、新しい配列としてupdateDataが作成される
  const mergeData: LsPokemon[] = [...currentArray, ...addArray];

  // idが重複している要素があったら削除
  // ⇒まだ見たことがないIDならMapに記録する
  const uniqueData: LsPokemon[] = Array.from(
    mergeData
      .reduce((map, pokemonData) => {
        // map=処理の集積
        // pokemonData=各要素
        if (!map.has(pokemonData.id)) {
          // 集積結果の中に今処理してるid値が存在して「ない」
          map.set(pokemonData.id, pokemonData);
          // 未登録ならこの場で登録＝一意にする
        }
        return map; // 一意に整理した集積結果を返す
      }, new Map<number, LsPokemon>())
      // id:number, pokemonData:LsPokemonの明示
      .values(), // reduce().valueの形式
  );
  // スプレッド構文で配列を複製＋id順に並べ直す
  // 0. showOder値を比較
  // 1. sp値を比較
  // 2. id値を比較
  // オブジェクトa,bを比較して、小さい方を前に配列の前方要素に移していく
  const sortData: LsPokemon[] = [...uniqueData].sort((a, b) => {
    // 第0キー
    if (a.showOder !== b.showOder) {
      return a.showOder - b.showOder;
    }

    // 第１キー
    if (a.sp !== null && b.sp != null && a.sp !== b.sp) {
      return a.sp - b.sp;
    }
    // 第２キー（第１キーの結果に拠らず実行）
    return a.id - b.id;
  });

  return sortData;
};

/**
 * 2. すべてが英字で構成されているか（空白なし）
 * @param str 判定対象の文字列
 * 対象：半角小文字大文字_-
 */
export const isOnlyAlphabet = (str: string): boolean => {
  return /^[a-zA-Z_-]+$/.test(str);
};

/**
 * 図鑑情報とバージョングループ情報からバージョン名を返す
 * @param pokedex:PokedexData[]
 * @param vGroupArray:number[] バージョングループidの配列
 * @returns PokedexData['vGroup'][number]['version'] バージョンを一意に整理したオブジェクト配列
 */
export const getVersions = (pokedexes: PokedexData[], vGroupArray: number[]): PokedexData['vGroup'][number]['version'] => {
  // 図鑑・バージョン情報をディープコピー
  const pokedex = structuredClone(pokedexes);
  // 図鑑データからバージョングループを取り出す
  const vGroups: PokedexData['vGroup'] = [...pokedex]
    .map((dex) => {
      return dex.vGroup;
    })
    .flat(); // 二重配列にならないよう平坦化

  // 対象のバージョングループidと一致するデータを抽出
  const targetVGroups: PokedexData['vGroup'] = [...vGroups].filter((group) => vGroupArray.includes(group.id));

  // バージョン情報だけ抜く
  const getVersions: PokedexData['vGroup'][number]['version'] = [...targetVGroups]
    .map((vGroup) => {
      return vGroup.version;
    })
    .flat(); // 二重配列にならないよう平坦化

  // id:44,45,46（日本版赤緑青）があったら
  // id:1,2（グローバル赤青）と置き換える

  const japanVersions: PokedexData['vGroup'][number]['version'] = [...getVersions].flatMap((version) => {
    // グローバル1,2を弾く
    if (version.id === 1 || version.id === 2) return [];

    // 日本赤緑青を0,1,2に上書き
    if (version.id === 44) {
      version.id = 0;
    } else if (version.id === 45) {
      version.id = 1;
    } else if (version.id === 46) {
      version.id = 2;
    }
    return version;
  });

  // 世代、id順にソート
  const sortedVersions: PokedexData['vGroup'][number]['version'] = [...japanVersions].sort((a, b) => {
    // 第１キー：世代
    if (a.generation !== b.generation) {
      return a.generation - b.generation;
    }

    // 第２キー：id
    return a.id - b.id;
  });

  // 重複削除
  // Set(配列)だとオブジェクトごとに別物判定⇒idを基準にMapで確実に処理
  const uniqueMap = new Map<number, PokedexData['vGroup'][number]['version'][number]>();
  [...sortedVersions].forEach((version) => {
    uniqueMap.set(version.id, version);
  });

  // 配列に戻して返す
  return Array.from(uniqueMap.values());
};
