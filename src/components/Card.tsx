// Cardコンポーネント

import React from 'react';
import type { LsPokemon } from '../utilities/types/typesUtility';
import { commonImgURL, types } from '../utilities/dataInfo';
import '../scss/Card.scss';

// propsの定義
interface CardProps {
  // Cardが受け取るべきプロパティ名とその型を定義
  pokemon: LsPokemon;
}
/* 要素の記述内に直接関数を記述しない方向にする */
// ⇒可読性を上げる

//// 内部で使う関数 ////
/*** @name
 *   @function
 *   @type function
 *   @props pokemon
 */

// サムネ画像作成
const renderImg = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.img && pokemon.name) {
    // 画像URL：有
    // 名前：有
    return <img className='cardImg' src={commonImgURL + pokemon.img} alt={pokemon.name} />;
  } else if (pokemon.name) {
    // 画像URL：null
    // 名前：有
    return <p>{pokemon.name}</p>;
  } else {
    // 画像URL：null
    // 名前：null
    return <p>No Image</p>;
  }
};

// フォルムチェンジなどの補足名
const renderDifferentName = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.difNm) {
    // 別名がある
    return <span className='difNm'> {pokemon.difNm}</span>;
  }
};

// タイプ表示
const renderTypes = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.type) {
    // タイプ別に画像表示
    //  タイプの数に分mapでループ処理して返す（複合タイプ）
    return pokemon.type.map((type: number) => {
      // ポケモンのタイプ番号と一致するdataInfo.tsxのタイプオブジェクトを取得
      const pokemonType = types.find((dataType) => dataType.number === type);
      // タイプオブジェクトを組み込んでJSXを作成
      return <img className='type' src={pokemonType?.imgURL} alt={pokemonType?.name} />;
    });
  }
};

/*** @name
 *   @function
 *   @type component
 *   @props pokemon
 */
const Card = ({ pokemon }: CardProps): React.ReactNode => {
  return (
    <div className='card' id={pokemon.id.toString()}>
      <h3>No.{pokemon.pokedex}</h3>
      {renderImg({ pokemon })}
      <h4 className='cardName'>
        {pokemon.name}
        {renderDifferentName({ pokemon })}
      </h4>
      <div className='cardTypes'>{renderTypes({ pokemon })}</div>
    </div>
  );
};

export default Card;
