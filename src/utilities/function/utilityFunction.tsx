/**
 * 各種パーツとして使用する関数を記述するファイル
 */
import type { NameAndURL, PokemonSpeciesDetail, PokemonDetail } from '../types/typesFetch';
import { commonImgURL } from '../dataInfo';
import type { LsPokemon } from '../types/typesUtility';

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
    const parts: string[] = eachResult.url.split('/');
    // 図鑑番号＝最後１つ前の配列を取得＋数値に明示変換して返す
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
  const jaHrktData = apiArray.find((item) => item.language.name === 'ja');
  // jaが存在した時点で返す
  if (jaHrktData) return [jaHrktData]; // 配列形式に変換して返す

  // どちらも該当しない→空配列を返す
  return [];
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

  // どちらも該当しない→空配列を返す
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
 * home > official-artwork > front_default > showdown の順に確認
 */
export const getDisplayImg = (obj: PokemonDetail['sprites']): string | null => {
  // URL共通部分（切り出し部分）
  const commonURL: string = commonImgURL;

  // 1. homeがあったらその時点で返す
  if (obj.other.home.front_default !== null) return obj.other.home.front_default?.split(commonURL)[1];

  // 2. official-artworkがあったらその時点で返す
  if (obj.other['official-artwork'].front_default !== null) return obj.other['official-artwork'].front_default.split(commonURL)[1];

  // 3. 直下のデータがあったらその時点で返す
  if (obj.front_default !== null) return obj.front_default.split(commonURL)[1];

  // 4. gifのデータがあったら返す（最終手段）
  if (obj.other.showdown.front_default !== null) return obj.other.showdown.front_default.split(commonURL)[1];

  // 本当に何もないときはnullで返す
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
  flavor_text_entries: [], // 配列などは空配列、それ以外はnullなど型に合わせて調整
  form_descriptions: [],
  forms_switchable: false,
  gender_rate: 0,
  genera: {
    genus: '',
    language: {
      name: '',
      url: '',
    },
  },
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

  // スプレッド構文で配列を複製＋id順に並べ直す
  // idの中身a,bを比較して、小さい方を前に配列の前方要素に移していく
  const sortData: LsPokemon[] = [...mergeData].sort((a, b) => a.id - b.id);

  // idが重複している要素があったら削除
  // ⇒まだ見たことがないIDならMapに記録する
  const uniqueData: LsPokemon[] = Array.from(
    sortData
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

  return uniqueData;
};
