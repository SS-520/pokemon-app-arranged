// ユーザー定義の型の集積ファイル

import type { Dispatch, SetStateAction } from 'react';
import type { PokemonListResponse, PokemonDetail } from './typesFetch';
// ＊外部から呼び出すのが全体の定義⇒export を付与

//// 状態変数の定義
// useStateのの中身を更新するための型
export type setURL = Dispatch<SetStateAction<PokemonListResponse['previous']> | PokemonListResponse['next']>;

export type setBoolean = Dispatch<SetStateAction<boolean>>;

export type setNumber = Dispatch<SetStateAction<number>>;

export type setTypePokemonDetailData = Dispatch<SetStateAction<PokemonDetail[]>>;

export interface BallDetails {
  number: number;
  name: string;
  imgURL: string;
}

export interface TypeDetails {
  number: number;
  name: string;
  imgURL: string;
}

// 全国図鑑番号を厳密に定義
export type PokedexNumber = number & { readonly __brand: 'PokedexNumber' };

// ローカルストレージに格納するデータの型
export interface LsPokemon {
  id: number; // 管理番号
  name: string | null; // 日本語名
  type: number[] | null; // タイプ
  pokedex: PokedexNumber | null; // 全国図鑑番号
  sp: number | null; // Species番号
  region: number[] | null; // 登場図鑑
  isGen: number | null; // オスメス差分の有無(true:有)
  egg: number[] | null; // 卵グループ
  img: string | null; // 表示用画像の可変部分URL
  difNm: string | null; // フォルムチェンジなど用
}

// モーダル開閉
export interface MainModalHandle {
  showModal: () => void;
  closeModal: () => void;
}
