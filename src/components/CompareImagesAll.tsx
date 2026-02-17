import React, { useState } from 'react';
import type { ImageObj, LsPokemon } from '../utilities/types/typesUtility';

// スタイル
import {} from '../scss/CompareImagesAll.scss';

// アイコン
import { BsStars } from 'react-icons/bs';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import { RxCircleBackslash } from 'react-icons/rx';

// propsの型設定
interface CompareImagesAllProps {
  images: ImageObj;
  name: LsPokemon['name'];
}
function CompareImagesAll({ images, name }: CompareImagesAllProps) {
  // 表示対象を管理するState
  // false⇒オスメス true⇒色違い
  const [isShow, setIsShow] = useState<boolean>(false);

  // false：オス true：メス
  const [isGender, setIsGender] = useState<boolean>(false);

  // false：通常 true；色違い
  const [isShiny, setIsShiny] = useState<boolean>(false);

  //// 表示画面切り替え関数

  // オスメス差分に変更
  const changeToGender = () => {
    if (isShow) setIsShow(false);
  };

  // 色違い画面に変更
  const changeToShiny = () => {
    if (!isShow) setIsShow(true);
  };

  // トグルボタンクリック時のハンドラー
  const handleToggle = (target: 'gender' | 'shiny') => {
    if (target === 'gender') setIsGender((prev) => !prev);
    if (target === 'shiny') setIsShiny((prev) => !prev);
  };

  /* 切り替え表示内容 */
  // オスメス表示
  const showGender = () => {
    return (
      <React.Fragment>
        <img src={isGender ? images.femaleImg! : images.defaultImg} alt={`${isGender ? 'メス' : 'オス'}の${name}の画像`} className='compareImg' />
        <div className='switchArea'>
          <span className='iconWrap before'>
            <IoMdMale />
          </span>
          <div className={`switchBox toggle ${isGender ? 'checked' : ''}`} onClick={() => handleToggle('gender')}>
            <input
              className='switch'
              type='checkbox'
              name='check'
              checked={isGender}
              onChange={() => {}} // onClickで制御するため、警告回避の空関数
            />
          </div>
          <span className='iconWrap after'>
            <IoMdFemale />
          </span>
        </div>
      </React.Fragment>
    );
  };

  // 色違い
  const showShiny = () => {
    return (
      <React.Fragment>
        <img src={isShiny ? images.shinyImg : images.defaultImg} alt={`${isShiny ? '色違い' : '通常'}の${name}の画像`} className='compareImg' />
        <div className='switchArea'>
          <span className='iconWrap before'>
            <RxCircleBackslash />
          </span>
          <div className={`switchBox toggle ${isShiny ? 'checked' : ''}`} onClick={() => handleToggle('shiny')}>
            <input
              className='switch'
              type='checkbox'
              name='check'
              checked={isShiny}
              onChange={() => {}} // onClickで制御するため、警告回避の空関数
            />
          </div>
          <span className='iconWrap after'>
            <BsStars />
          </span>
        </div>
      </React.Fragment>
    );
  };

  /* レンダリング結果 */
  return (
    <div className='compareImages'>
      <button className={`buttonGender ${isShow ? 'off' : 'on'}`} onClick={() => changeToGender()}>
        <IoMdMale />
        <IoMdFemale />
      </button>
      <button className={`buttonShiny ${isShow ? 'on' : 'off'}`} onClick={() => changeToShiny()}>
        <BsStars />
      </button>
      <div className='imageArea'>{isShow ? showShiny() : showGender()}</div>
    </div>
  );
}

export default CompareImagesAll;
