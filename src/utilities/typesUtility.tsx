// ユーザー定義の型の集積ファイル

import type { Dispatch, SetStateAction } from 'react';
import type { PokemonListResponse, PokemonDetail } from './types-fetch';
// ＊外部から呼び出すのが全体の定義⇒export を付与

//// 状態変数の定義
// useStateのの中身を更新するための型
export type setURL = Dispatch<SetStateAction<PokemonListResponse['previous']> | PokemonListResponse['next']>;
export type setBoolean = Dispatch<SetStateAction<boolean>>;
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
