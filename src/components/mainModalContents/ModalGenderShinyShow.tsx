// 画像比較（並列）セクション


import React from 'react'

// types
import type { ImageObj } from '../../utilities/types/typesUtility';
import noImage from '../../img/noImage.png';


// アイコン
import { BsStars } from 'react-icons/bs';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import type { LsPokemon } from '../../utilities/types/typesUtility';

// props
interface ModalGenderShinyDiffProps {
  images: ImageObj;
  name: LsPokemon['name'];
}

const ModalGenderShinyDiff = ({images, name}: ModalGenderShinyDiffProps): React.ReactNode => {

  // 本体
  const setImgs = (
  images: ImageObj,
  name: LsPokemon['name'],
): React.ReactNode => {
  // オスメス差分

  if (images.femaleImg && images.shinyFemaleImg) {
    // オスメス＋それぞれ色違いの画像でオブジェクト

    return (
      <React.Fragment>
        <div className='defaultImg'>
          <figure className='detail male'>
            <figcaption>
              <IoMdMale />
            </figcaption>
            <img src={images.defaultImg} alt={`${name}・オスの画像`} />
          </figure>
          <figure className='detail female'>
            <figcaption>
              <IoMdFemale />
            </figcaption>
            <img src={images.femaleImg} alt={`${name}・メスの画像`} />
          </figure>
        </div>
        <hr />
        <div className='shinyImg'>
          <figure className='shiny male'>
            <figcaption>
              <BsStars />
              <IoMdMale />
            </figcaption>
            <img src={images.shinyImg} alt={`${name}・オスの色違い画像`} />
          </figure>
          <figure className='shiny female'>
            <figcaption>
              <BsStars />
              <IoMdFemale />
            </figcaption>
            <img
              src={images.shinyFemaleImg}
              alt={`${name}・メスの色違い画像`}
            />
          </figure>
        </div>
      </React.Fragment>
    );
  } else if (images.defaultImg !== '') {
    return (
      <React.Fragment>
        <div className='commonImg'>
          <figure className='detail male'>
            <figcaption>
              <IoMdMale />
              <IoMdFemale />
            </figcaption>
            <img src={images.defaultImg} alt={`${name}の画像`} />
          </figure>
          <figure className='shiny male'>
            <figcaption>
              <BsStars /> <IoMdMale />
              <IoMdFemale />
            </figcaption>
            <img src={images.shinyImg} alt={`${name}の色違い画像`} />
          </figure>
        </div>
      </React.Fragment>
    );
  } else {
    // 画像がない場合
    <React.Fragment>
      <div className='commonImg'>
        <figure className='detail male'>
          <figcaption>
            <IoMdMale />
            <IoMdFemale />
          </figcaption>
          <img src={noImage} alt={`未登録の${name}の画像`} />
        </figure>
        <figure className='shiny male'>
          <figcaption>
            <BsStars /> <IoMdMale />
            <IoMdFemale />
          </figcaption>
          <img src={noImage} alt={`未登録の${name}の色違い画像`} />
        </figure>
      </div>
    </React.Fragment>;
  }
};


  // 描画
  return (
    <section className='imgDiff maskingTapeStyleBase'>
      <h5 className='diffImgTitle maskingTapeStyleTitle'>比較画像</h5>
      {setImgs(images,name)}
    </section>
  )
}

export default ModalGenderShinyDiff