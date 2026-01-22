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
export type setSelectPokemon = Dispatch<SetStateAction<LsPokemon | null>>;

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
  type: number[]; // タイプ
  pokedex: PokedexNumber; // 全国図鑑番号
  sp: number; // Species番号
  region: number[]; // 登場図鑑
  ge: number[]; // 初出世代
  isGen: number; // オスメス差分の有無(true:有)
  egg: number[]; // 卵グループ
  img: string | null; // 表示用画像の可変部分URL
  difNm: string | null; // フォルムチェンジなど用
  showOder: number; //0:通常,11:メガ進化,21:大マックス,99:非表示（アローラぬしとか合言葉配布とか）
}

// モーダル開閉
export interface MainModalHandle {
  showModal: () => void;
  closeModal: () => void;
}

// 図鑑バージョン地域（配列化してLSへ）
export interface PokedexData {
  id: number;
  name: string;
  isMain: boolean;
  region: { id: number; name: string; mainGene: number };
  vGroup: { id: number; version: { id: number; name: string; generation: number }[] }[];
}

// 特性情報（fetch）
// https://pokeapi.co/api/v2/ability/n/
export interface AbilityData {
  id: number;
  name: string;
  flavor_text_entries: {
    flavor_text: string;
    version_group: number[];
  }[];
}
