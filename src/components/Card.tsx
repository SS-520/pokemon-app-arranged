// Cardコンポーネント

import React from 'react';
import type { PokemonDetail } from '../utilities/types';

// propsの定義
interface CardProps {
  // Cardが受け取るべきプロパティ名とその型を定義
  pokemon: PokemonDetail;
}

/*** @name
 *   @function
 *   @type component
 *   @props pokemon
 */
const Card = ({ pokemon }: CardProps) => {
  return <div>Card</div>;
};

export default Card;
