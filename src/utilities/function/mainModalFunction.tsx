/* メインモーダル関連の処理 */

import type { Result } from 'neverthrow';
import type { FetchError, PokemonDetail, PokemonSpeciesDetail } from '../types/typesFetch';
import type { LsPokemon } from '../types/typesUtility';
import { getPokemonData } from './loadPokemonFunction';
import { alertError } from './fetchFunction';

export const fetchDetails = async (pokemon: LsPokemon, signal: AbortSignal) => {
  // ⇒ポケモンAPIから最新データを取得（基本情報）
  const pokemonDetails: Result<PokemonDetail[], FetchError> = await getPokemonData<PokemonDetail>([pokemon.id], 'pokemon', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonDetails.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonDetails);
    return; // 関数実行終了
  }

  // ⇒ポケモンAPIから最新データを取得（種類別情報）
  if (pokemon.sp !== null) {
    const pokemonSpeciesResult: Result<PokemonSpeciesDetail[], FetchError> = await getPokemonData<PokemonSpeciesDetail>([pokemon.sp], 'pokemon-species', signal);
    if (pokemonSpeciesResult.isErr()) {
      // 画面にエラー内容表示
      alertError(pokemonSpeciesResult);
      return; // 関数実行終了
    }
  }
};

// ToDo バージョン関連の情報を突き合わせる

// ToDo アビリティ情報も突き合わせる

//内部の変数が変わる都度再取得（useEffectの仕様）
