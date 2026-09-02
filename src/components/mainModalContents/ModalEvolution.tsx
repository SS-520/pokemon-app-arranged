// 進化系統セクション

import React from 'react';
import { PiArrowFatLinesRight } from 'react-icons/pi';
import type { EvoObj } from '../../utilities/types/typesUtility';
import { commonImgURL } from '../../utilities/dataInfo';

// プロップスの型定義
interface ModalEvolutionProps {
  evolutions: EvoObj[];
}

export const ModalEvolution= ({ evolutions }:ModalEvolutionProps) => {
 
  // 進化無しの場合：evolutions.length=1⇒本人だけ
  if (evolutions.length <= 1) {
    return (
      <section className='evolution maskingTapeStyleBase'>
        <h5 className='evolutionTitle title maskingTapeStyleTitle'>進化の流れ</h5>
        <div className='evolutionDetail'>進化無し</div>
      </section>
    );
  } else {
    // 進化有の場合（メイン）
    
    // 進化分岐の有無判定
    let evoBranch = 'straight';
    evolutions.map((evo, index) => {
      const preLevel = index > 0 ? evolutions[index - 1] : null;
      if (evo.level === preLevel?.level) {
        evoBranch = 'branch';
      }
    });
    return (
      <React.Fragment>
        <div className='evolutionDetail'>
        {evolutions.map((evo, index) => {
          // 前後周との進化段階比較
          const preLevel = index > 0 ? evolutions[index - 1] : null;
          const nextLevel = index > 0 ? evolutions[index + 1] : null;

          // 同じ段階があるかないか判定
          let onlyLevel = '';
          if (preLevel?.level === evo.level) {
            onlyLevel = 'notOnly';
          } else if (nextLevel?.level === evo.level) {
            onlyLevel = 'notOnly';
          } else {
            onlyLevel = 'only';
          }

          // 接続記号を設定
          let connector = null;
          if (preLevel) {
            // 2周目以降はコネクタを挟む
            connector = (
              <span
                className={`connecter level${evo.level} ${onlyLevel} ${evoBranch}`}
              >
                <PiArrowFatLinesRight />
              </span>
            );
          }
          return (
            <React.Fragment key={evo.id}>
              {connector}
              <figure
                className={`evoPokemon level${evo.level} ${onlyLevel} ${evoBranch}`}
                data-id={evo.id}
              >
                <figcaption className='evoForm'>
                  {preLevel?.level !== evo.level ? evo.evoForm : ''}
                </figcaption>
                <img
                  className='evoImg'
                  src={commonImgURL + evo.img}
                  alt={`${evo.name}の画像`}
                />
                <figcaption className='name'>{evo.name}</figcaption>
              </figure>
            </React.Fragment>
          );
        })}
          </div>
        <p className='annotation'>
          ※通常／リージョンフォームが混在する場合があります
        </p>
      </React.Fragment>
    );
  };
};

export default ModalEvolution;