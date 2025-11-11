// Cardコンポーネント

import React from 'react';
import type { PokemonDetail } from '../utilities/types';
import '../scss/Card.scss';

// propsの定義
interface CardProps {
  // Cardが受け取るべきプロパティ名とその型を定義
  pokemon: PokemonDetail;
}
/* 要素の記述内に直接関数を記述しない方向にする */
// ⇒可読性を上げる

//// 内部で使う関数 ////
/*** @name
 *   @function
 *   @type function
 *   @props pokemon
 */
const getTypes = ({ pokemon }: CardProps): React.ReactNode => {
  // mapの結果を直接返すことで型がReact.ReactNodeになるように設定
  return pokemon.types.map((eachType) => {
    return (
      <div>
        <span className='typeName'>{eachType.type.name}</span>
      </div>
    );
  });
};

/*** @name
 *   @function
 *   @type component
 *   @props pokemon
 */
const Card = ({ pokemon }: CardProps): React.ReactNode => {
  return (
    <div className='card'>
      <div className='cardImg'>
        <img src={pokemon.sprites.front_default} alt={`${pokemon.name}'s front img`} /> {/* JSX記法でtsを記述 */}
      </div>
      <h3 className='cardName'>{pokemon.name}</h3>
      <div className='cardTypes'>
        <div>タイプ</div>
        <div>{getTypes({ pokemon })}</div>
      </div>
      <div className='cardInfo'>
        <div className='cardData'>
          <p className='title'>平均体長：{pokemon.height / 10}m</p>
        </div>
        <div className='cardData'>
          <p className='title'>平均体重：{pokemon.weight / 10}kg</p>
        </div>
        <div className='cardData'>
          <p className='title'>特性：{pokemon.abilities[0].ability.name}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
