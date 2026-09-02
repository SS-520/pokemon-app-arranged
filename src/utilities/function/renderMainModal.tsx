/* メインモーダルの表示内容制御するファイル */

import React from 'react';
import { commonImgURL, eggs, types } from '../dataInfo';
import type {
  AbilityObj,
  DiffFormsObj,
  EggDetails,
  EvoObj,
  FlavorObj,
  ImageObj,
  LsPokemon,
  PokedexData,
  PokedexObj,
  RenderObj,
  TypeDetails,
} from '../types/typesUtility';
import { getJaData } from './utilityFunction';
import type { PokemonDetail, PokemonSpeciesDetail } from '../types/typesFetch';
import noImage from '../../img/noImage.png';

// アイコン
import { IoMdMale, IoMdFemale } from 'react-icons/io';

// コンポーネント
import ModalEvolution from '../../components/mainModalContents/ModalEvolution';
import ModalAbilities from '../../components/mainModalContents/ModalAbilities';
import ModalFlavorText from '../../components/mainModalContents/ModalFlavorText';
import ModalEncountVersions from '../../components/mainModalContents/ModalEncountVersions';
import ModalVariation from '../../components/mainModalContents/ModalVariation';
import ModalGenderShinyShow from '../../components/mainModalContents/ModalGenderShinyShow';
import ModalGenderShinyCompare from '../../components/mainModalContents/ModalGenderShinyCompare';
import ModalRegions from '../../components/mainModalContents/ModalRegions';
import ModalEggGroups from '../../components/mainModalContents/ModalEggGroups';

/**
// API取得の情報と各種情報を加工・突合する
/*** @name renderMainModal
 *   @function arrow
 *   @param pokemon:LsPokemon 対象基礎情報
 *   @param mergeResult :RenderObj API取得情報加工データ
 *   @param pokedexData :PokedexData[] 図鑑・バージョン情報全般
 *   @param pokemonDetail :PokemonDetail 図鑑・バージョン情報全般
 *   @param pokemonSpecies :PokemonSpeciesDetail 図鑑・バージョン情報全般
 *   @return ReactNode

 */
export const renderMainModal = (
  pokemon: LsPokemon,
  mergeResult: RenderObj,
  pokedexData: PokedexData[],
  pokemonDetail: PokemonDetail,
  pokemonSpecies: PokemonSpeciesDetail,
): React.ReactNode => {
  // 引数を整理
  const image: ImageObj = mergeResult.imgObj;
  const pokedex: PokedexObj = mergeResult.pokedexObj;
  const ability: AbilityObj[] = mergeResult.abilityObj;
  const flavorText: FlavorObj[] = mergeResult.flavorObj;
  const evolution: EvoObj[] = mergeResult.evoObj;
  const variation: DiffFormsObj = mergeResult.variationFormObj;

  // 種族（○○ポケモン）
  const pokemonGenus: PokemonSpeciesDetail['genera'][number] = getJaData<
    PokemonSpeciesDetail['genera'][number]
  >(pokemonSpecies.genera)[0];

  // メインの画像
  const mainImage: string = pokemon.img ? commonImgURL + pokemon.img : noImage;
  const mainImageAltComment: string = pokemon.name ? pokemon.name : 'No Image';

  // タイプ
  const allTypes: TypeDetails[] = types;
  const typeImage = (): React.ReactNode => {
    return pokemon.type.map((type: number) => {
      const pokemonType = allTypes.find((dataType) => dataType.number === type);
      // タイプオブジェクトを組み込んでJSXを作成
      return (
        <img
          className='type'
          src={pokemonType?.imgURL}
          alt={pokemonType?.name}
          key={pokemonType?.number}
        />
      );
    });
  };

  // べビ・幻・伝説判定
  const isBaby = (): React.ReactNode => {
    return (
      <span className={`baby tiles ${pokemonSpecies.is_baby ? 'show' : ''}`}>
        ベイビィ
      </span>
    );
  };
  const isLegend = (): React.ReactNode => {
    return (
      <span
        className={`legend tiles ${pokemonSpecies.is_legendary ? 'show' : ''}`}
      >
        伝説
      </span>
    );
  };
  const isMythic = (): React.ReactNode => {
    return (
      <span
        className={`mythic tiles ${pokemonSpecies.is_mythical ? 'show' : ''}`}
      >
        幻
      </span>
    );
  };

  // サイズ
  const pokemonSize = (): React.ReactNode => {
    return (
      <React.Fragment>
        <div className='height'>体長: {pokemonDetail.height / 10}m</div>
        <div>体重: {pokemonDetail.weight / 10}kg</div>
      </React.Fragment>
    );
  };

  // オスメス確率
  const rateGender = (): React.ReactNode => {
    const rate: number = pokemonSpecies.gender_rate;
    if (rate < 0) {
      return <React.Fragment>性別無</React.Fragment>;
    } else {
      const maleRate: number = ((8 - rate) / 8) * 100;
      const femaleRate: number = (rate / 8) * 100;
      return (
        <React.Fragment>
          <div className='genderRate male'>
            <IoMdMale /> {maleRate}%
          </div>
          <div className='genderRate female'>
            <IoMdFemale /> {femaleRate}%
          </div>
        </React.Fragment>
      );
    }
  };

  // 描写内容（戻り値）
  return (
    <article className={`modalContents ${pokemonSpecies.color.name}`}>
      <header className='header'>
        <div className='nationalPokedex'>全国図鑑 No.{pokemon.pokedex}</div>
        <h4 className='pokemonName'>
          {pokemon.name}{' '}
          <span className='diffName'>{pokemon.difNm ? pokemon.difNm : ''}</span>
        </h4>
      </header>
      <section className='mainIntroduction'>
        <h5 className='mainImage'>
          <img
            src={mainImage}
            alt={`${mainImageAltComment}の画像`}
            className='modalMainImage'
          />
        </h5>
        <p className='genus'>{pokemonGenus ? pokemonGenus.genus : ''}</p>
        <div className='pokemonTypes'>{typeImage()}</div>
        <div className='size'>{pokemonSize()}</div>
        <div className='genderRates'>{rateGender()}</div>
        <div className='special'>
          {isBaby()}
          {isLegend()}
          {isMythic()}
        </div>

        {/* 登場地方 */}
        <ModalRegions pokedex={pokedex} pokedexData={pokedexData} isDefault={pokemonDetail.is_default} />
      </section>

      {/* 画像比較表示 */}
      <ModalGenderShinyShow images={image} name={pokemon.name} />

      {/* 重ねて画像比較 */}
      <ModalGenderShinyCompare image={image} pokemon={pokemon} />
      
      {/* 進化系統 */}
      <ModalEvolution evolutions={evolution}/>

      {/* 別フォーム */}
      <ModalVariation variation={variation}/>


      {/* 野生登場バージョン */}
      <ModalEncountVersions pokedexData={pokedexData} pokedex={pokedex} pokemon={pokemon} isDefault={pokemonDetail.is_default}/>


      {/* 卵グループ */}
      <ModalEggGroups pokemon={pokemon}/>
      
      {/* 特性情報 */}
      <ModalAbilities abilities={ability}/>
      
      {/* 図鑑解説テキスト */}
      <ModalFlavorText flavorTextes={flavorText} isDefault={pokemonDetail.is_default}/>
    </article>
  );
};

