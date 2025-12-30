/**
 * 各種パーツとして使用する関数を記述するファイル
 */
import type { PokedexNumber } from './typesUtility';
import type { NameAndURL, PokemonSpeciesDetail } from './typesFetch';

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

  // 配列に格納された全図鑑番号を返す
  return endIDs;
}

/**
 * number型の値をPokedexNumber型にキャストする関数
 * @param pokeNum:number 図鑑番号として扱いたい数値
 * @returns PokedexNumber型にキャストされた数値
 */
export function toPokedexNumber(pokeNum: number): PokedexNumber {
  // 実行時には単純な数値ですが、型システム上はブランドが付与されます
  return pokeNum as PokedexNumber;
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
