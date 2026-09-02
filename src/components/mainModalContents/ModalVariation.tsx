// 別フォームセクション

import React from 'react'
import type { DiffForms, DiffFormsSpecies } from '../../utilities/types/typesUtility'
import { commonImgURL } from '../../utilities/dataInfo';
import noImage from '../../img/noImage.png';

// props
interface ModalVariationProps {
  variation: {
    variationResults: DiffFormsSpecies[];
    formsResults: DiffForms[];
  }
}


// 本体
const ModalVariation = ({variation}: ModalVariationProps): React.ReactNode => {

  // 描画処理
  const setVariation = (variation: {
    variationResults: DiffFormsSpecies[];
    formsResults: DiffForms[];
  }): React.ReactNode => {
    // 引数を分解
    const variations: DiffFormsSpecies[] = variation.variationResults;
    const forms: DiffForms[] = variation.formsResults;

    // variationResultsとformsResultsの両方がある場合
    if (variations.length > 0 && forms.length > 0) {
      return (
        <React.Fragment>
          <div className='groupVariation'>
            {variations.map((variation, varIndex) => (
              <figure className='form' data-id={variation.id} key={varIndex}>
                <figcaption className='formName'>{variation.formName}</figcaption>
                <img
                  src={commonImgURL + variation.img}
                  className='formImg'
                  alt={`${variation.formName}の画像`}
                />
              </figure>
            ))}
          </div>
          <hr />
          <div className='groupForm'>
            {forms.map((form, formIndex) => (
              <figure className='form' data-id={form.order} key={formIndex}>
                <figcaption className='formName'>{form.formName}</figcaption>
                <img
                  src={commonImgURL + form.img}
                  className='formImg'
                  alt={`${form.formName}の画像`}
                />
              </figure>
            ))}
          </div>
        </React.Fragment>
      );
    } else if (variations.length > 0) {
      return (
        <div className='groupVariation'>
          {variations.map((variation, varIndex) => (
            <figure className='form' data-id={variation.id} key={varIndex}>
              <figcaption className='formName'>{variation.formName}</figcaption>
              <img
                src={
                  variation.img !== '' ? commonImgURL + variation.img : noImage
                }
                alt={`${variation.formName}の画像`}
                className='formImg'
              />
            </figure>
          ))}
        </div>
      );
    } else if (forms.length > 0) {
      return (
        <div className='groupForm'>
          {forms.map((form, formIndex) => (
            <figure className='form' data-id={form.order} key={formIndex}>
              <figcaption className='formName'>{form.formName}</figcaption>
              <img
                src={form.img !== '' ? commonImgURL + form.img : noImage}
                className='formImg'
                alt={`${form.formName}の画像`}
              />
            </figure>
          ))}
        </div>
      );
    } else {
      return;
    }
  };

  // 描画部分
  return (
    <>
      {setVariation(variation) ? (
        // 別フォームがなければ表示しない
        <section className='variation maskingTapeStyleBase'>
          <h5 className='variationTitle title maskingTapeStyleTitle'>
            別フォーム
          </h5>
          <div className='variationDetail'>{setVariation(variation)}</div>
        </section>
      ) : (
        <></>
      )}
    </>
  )
}

export default ModalVariation
