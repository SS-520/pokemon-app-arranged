// Cardコンポーネント

import React from 'react';
import type { LsPokemon } from '../utilities/types/typesUtility';
import { commonImgURL } from '../utilities/dataInfo';
import '../scss/Card.scss';
import noImage from '../img/noImage.png';
import TypeBadges from './common/TypeBadges';

// propsの定義
interface CardProps {
  // Cardが受け取るべきプロパティ名とその型を定義
  pokemon: LsPokemon;
}

/*** @name
 *   @function
 *   @type component
 *   @props pokemon
 *  複数回実行＋処理軽量化のためメモ化処理
 */
const Card = React.memo(({ pokemon }: CardProps): React.ReactNode => {
  return (
    <div className='card' data-id={pokemon.id.toString()}>
      <h3>No.{pokemon.pokedex}</h3>
      <RenderImg pokemon={pokemon} />
      <h4 className='cardName'>
        {pokemon.name}
        <RenderDifferentName pokemon={pokemon} />
      </h4>
      <div className='cardTypes'>
        <RenderTypes pokemon={pokemon} />
      </div>
    </div>
  );
});

export default Card;

// 各パーツをコンポーネントとして独立管理

// サムネ画像作成
const RenderImg = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.img && pokemon.name) {
    // 画像URL：有
    // 名前：有
    return (
      <img
        className='cardImg'
        src={commonImgURL + pokemon.img}
        alt={pokemon.name}
      />
    );
  } else {
    // 画像URL：null
    // 名前：null
    return <img className='cardImg' src={noImage} alt='画像無し' />;
  }
};

// フォルムチェンジなどの補足名
const RenderDifferentName = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.difNm) {
    // 別名がある
    return <div className='difNm'>{pokemon.difNm}</div>;
  } else {
    // 別名がない（高さ統一のため全角スペース挿入）
    // eslint-disable-next-line no-irregular-whitespace
    return <div className='difNm'>　</div>;
  }
};

// タイプ表示
const RenderTypes = ({ pokemon }: CardProps): React.ReactNode => {
  if (pokemon.type) {
    // タイプ別に画像表示
    //  タイプの数に分mapでループ処理して返す（複合タイプ）
    return <TypeBadges typeNumbers={pokemon.type} /> 
  }
  
  // タイプがない場合
  return null;
};
