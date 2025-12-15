/**
 * 各種パーツとして使用する関数を記述するファイル
 */
import type { PokedexNumber } from './typesUtility';

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

/**
 * number型の値をPokedexNumber型にキャストする関数
 * @param pokeNum:number 図鑑番号として扱いたい数値
 * @returns PokedexNumber型にキャストされた数値
 */
export function toPokedexNumber(pokeNum: number): PokedexNumber {
  // 実行時には単純な数値ですが、型システム上はブランドが付与されます
  return pokeNum as PokedexNumber;
}
