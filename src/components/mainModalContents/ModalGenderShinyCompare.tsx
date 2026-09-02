// 画像比較（切り替え）セクション

import React from 'react';

// コンポーネント
import CompareImagesShiny from '../../components/CompareImagesShiny';
import CompareImagesAll from '../../components/CompareImagesAll';
import type { ImageObj, LsPokemon } from '../../utilities/types/typesUtility';

// props
interface ModalGenderShinyCompareProps {
  image: ImageObj;
  pokemon: LsPokemon;
}

// 本体
const ModalGenderShinyCompare = ({ image, pokemon }: ModalGenderShinyCompareProps):React.ReactNode => {

  const compareImage = (image: ImageObj, pokemon: LsPokemon): React.ReactNode => {
    if (image.femaleImg) {
      return (
        <section className='compareDiff maskingTapeStyleBase'>
          <h5 className='compareDiffTitle maskingTapeStyleTitle'>
            重ねて比較！
          </h5>
          <div className='maskingTapeStyleContents'>
            <CompareImagesAll images={image} name={pokemon.name} />
          </div>
        </section>
      );
    } else if (image.shinyImg) {
      return (
        <section className='compareDiff maskingTapeStyleBase'>
          <h5 className='compareDiffTitle maskingTapeStyleTitle'>
            重ねて比較！
          </h5>
          <div className='maskingTapeStyleContents'>
            <CompareImagesShiny images={image} name={pokemon.name} />
          </div>
        </section>
      );
    } else {
      <React.Fragment></React.Fragment>;
    }
  };


  return (
    <>{ compareImage(image, pokemon) }</>
  )
}

export default ModalGenderShinyCompare
