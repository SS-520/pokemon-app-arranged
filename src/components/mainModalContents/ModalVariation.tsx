// 別フォームセクション

import React from 'react';
import type {
  DiffForms,
  DiffFormsSpecies,
} from '../../utilities/types/typesUtility';
import { commonImgURL } from '../../utilities/dataInfo';
import noImage from '../../img/noImage.png';

// props
interface ModalVariationProps {
  variation: {
    variationResults: DiffFormsSpecies[];
    formsResults: DiffForms[];
  };
}

// 本体
const ModalVariation = ({
  variation,
}: ModalVariationProps): React.ReactNode => {
  // 描画処理
  const setVariation = (variation: {
    variationResults: DiffFormsSpecies[];
    formsResults: DiffForms[];
  }): React.ReactNode | null => {
    // 引数を分解
    const variations: DiffFormsSpecies[] = variation.variationResults;
    const forms: DiffForms[] = variation.formsResults;

    // variationResultsとformsResultsの両方がある場合
    if (variations.length > 0 && forms.length > 0) {
      return (
        <React.Fragment>
          <ul className='groupVariation'>
            {variations.map((variation, varIndex) => (
              <li key={varIndex}>
                <figure className='form' data-id={variation.id}>
                  <figcaption className='formName'>
                    {variation.formName}
                  </figcaption>
                  <img
                    src={commonImgURL + variation.img}
                    className='formImg'
                    alt={`${variation.formName}の画像`}
                    loading='lazy' // 表示されるまで読み込まない
                    decoding='async' // 裏で準備するからメイン処理を邪魔しない
                  />
                </figure>
              </li>
            ))}
          </ul>
          <hr />
          <ul className='groupForm'>
            {forms.map((form, formIndex) => (
              <li key={formIndex}>
                <figure className='form' data-id={form.order}>
                  <figcaption className='formName'>{form.formName}</figcaption>
                  <img
                    src={commonImgURL + form.img}
                    className='formImg'
                    alt={`${form.formName}の画像`}
                    loading='lazy' // 表示されるまで読み込まない
                    decoding='async' // 裏で準備するからメイン処理を邪魔しない
                  />
                </figure>
              </li>
            ))}
          </ul>
        </React.Fragment>
      );
    } else if (variations.length > 0) {
      return (
        <ul className='groupVariation'>
          {variations.map((variation, varIndex) => (
            <li key={varIndex}>
              <figure className='form' data-id={variation.id}>
                <figcaption className='formName'>
                  {variation.formName}
                </figcaption>
                <img
                  src={
                    variation.img !== ''
                      ? commonImgURL + variation.img
                      : noImage
                  }
                  alt={`${variation.formName}の画像`}
                  className='formImg'
                  loading='lazy' // 表示されるまで読み込まない
                  decoding='async' // 裏で準備するからメイン処理を邪魔しない
                />
              </figure>
            </li>
          ))}
        </ul>
      );
    } else if (forms.length > 0) {
      return (
        <ul className='groupForm'>
          {forms.map((form, formIndex) => (
            <li key={formIndex}>
              <figure className='form' data-id-form={form.order}>
                <figcaption className='formName'>{form.formName}</figcaption>
                <img
                  src={form.img !== '' ? commonImgURL + form.img : noImage}
                  className='formImg'
                  alt={`${form.formName}の画像`}
                  loading='lazy' // 表示されるまで読み込まない
                  decoding='async' // 裏で準備するからメイン処理を邪魔しない
                />
              </figure>
            </li>
          ))}
        </ul>
      );
    } else {
      return null;
    }
  };

  // 描画部分
  //  別フォームがあるか先に確認してから描画
  const variationContent: React.ReactNode | null = setVariation(variation);

  // 中身が空ならここで終わり
  if (!variationContent) return null;

  // 中身があったら描画
  return (
    <section className='variation maskingTapeStyleBase'>
      <h3 className='variationTitle title maskingTapeStyleTitle'>別フォーム</h3>
      <div className='variationDetail'>{variationContent}</div>
    </section>
  );
};

export default ModalVariation;
