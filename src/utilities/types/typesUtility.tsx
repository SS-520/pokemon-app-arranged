// ユーザー定義の型の集積ファイル

import type { Dispatch, SetStateAction } from 'react';
import type { PokemonListResponse, PokemonDetail } from './typesFetch';
// ＊外部から呼び出すのが全体の定義⇒export を付与

//// 状態変数の定義
// useStateのの中身を更新するための型
export type setURL = Dispatch<
  SetStateAction<PokemonListResponse['previous']> | PokemonListResponse['next']
>;

export type setBoolean = Dispatch<SetStateAction<boolean>>;

export type setNumber = Dispatch<SetStateAction<number>>;

export type setSelectPokemon = Dispatch<SetStateAction<LsPokemon | null>>;
export type setTypePokemonDetailData = Dispatch<
  SetStateAction<PokemonDetail[]>
>;

export type setPokemonAllData = Dispatch<SetStateAction<LsPokemon[]>>;
export type setPokedexData = Dispatch<SetStateAction<PokedexData[]>>;
export type setAbilityData = Dispatch<SetStateAction<AbilityData[]>>;

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

export interface EggDetails {
  number: number;
  name: string;
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
  ge: number; // 初出世代
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
  vGroup: {
    id: number;
    version: { id: number; name: string; generation: number }[];
  }[];
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

// オスメス色違いの画像型
export interface ImageObj {
  defaultImg: string;
  femaleImg: string | null;
  shinyImg: string;
  shinyFemaleImg: string | null;
}
// 出現バージョン・ソフトの型
export interface PokedexObj {
  regionNames: string[];
  versionNames: {
    id: number;
    name: string;
    generation: number;
  }[];
}
// 特性情報の型
export interface AbilityObj {
  id: number;
  is_hidden: boolean;
  name: string;
  text: {
    text: string;
    version: {
      id: number;
      name: string;
      generation: number;
    }[];
  }[];
}

//フレーバーテキストの型
export interface FlavorObj {
  text: string;
  version: {
    id: number;
    name: string;
    generation: number;
  }[];
}

// フレーバーテキストの処理で使用
export interface FlavorInfo {
  flavor_text: string;
  version_group: number[];
}

// Speciesに含まれる別形態
export interface DiffFormsSpecies {
  id: number;
  formName: string;
  img: string;
}

// formsに含まれる別形態
export interface DiffForms {
  order: number;
  formName: string;
  img: string;
}

export interface DiffFormsObj {
  variationResults: DiffFormsSpecies[];
  formsResults: DiffForms[];
  isDefault: boolean;
}

// 進化系統の情報（加工工程）
export interface EvoProcess {
  species: {
    name: string;
    url: string;
  };
  is_baby: boolean;
  level: number;
}

// 進化系統の情報（出力結果）
export interface EvoObj {
  id: number; // 管理id
  is_main: boolean; // メイン？
  evoForm: string; // 進化状態
  level: number; // 進化階層
  is_baby: boolean; // べビポケ？
  eggItem: string;
  name: string;
  img: string;
}

// モーダルレンダリングに使う情報
export interface RenderObj {
  imgObj: ImageObj;
  pokedexObj: PokedexObj;
  abilityObj: AbilityObj[];
  flavorObj: FlavorObj[];
  variationFormObj: DiffFormsObj;
  evoObj: EvoObj[];
}
