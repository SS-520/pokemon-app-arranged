// 図鑑解説文セクション


import React from 'react';
import type { FlavorObj } from '../../utilities/types/typesUtility';

// アイコン
import { FaPenFancy } from 'react-icons/fa6';
import { MdCatchingPokemon } from 'react-icons/md';

// props
interface ModalFlavorTextProps {
  flavorTextes: FlavorObj[];
  isDefault: boolean;
}

// 本体
const ModalFlavorText = ({ flavorTextes, isDefault }: ModalFlavorTextProps):React.ReactNode => {
  
  // 解説文表示
  const showFlavorText = (flavorTextes: FlavorObj[]) => {
    if (flavorTextes.length > 0) {
      return (
        <React.Fragment>
          {flavorTextes.map((text) => {
            return (
              <React.Fragment key={text.text}>
                <li className='flavorTextArea textArea'>
                  <div className='flavorText'>
                    <FaPenFancy className='firstMark' />{' '}
                    {text.text ? text.text : 'データ未登録'}
                  </div>
                  <div className='flavorTextVersionArea versionArea'>
                    <MdCatchingPokemon />
                    {text.version.map((ver, verIndex) => (
                      <span
                        className='flavorTextVersion textVersion'
                        key={verIndex}
                      >
                        {ver.name}
                      </span>
                    ))}
                  </div>
                </li>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    } else {
      return (
        <div className='flavorTextArea'>
          <div className='flavorText noText'>
            <FaPenFancy />
            図鑑説明文：データ未登録
          </div>
        </div>
      );
    }
  };

  // メインの戻り値
  return (
    <section className='flavor maskingTapeStyleBase'>
      <h5 className='flavorTextTitle title maskingTapeStyleTitle'>
        図鑑解説テキスト
      </h5>
      <ul className='flavorTextDetail'>{showFlavorText(flavorTextes)}</ul>
    {!isDefault &&
      <p className='annotation'>※通常フォームのテキストが表示されます</p>
    }
    </section>
  )
}

export default ModalFlavorText