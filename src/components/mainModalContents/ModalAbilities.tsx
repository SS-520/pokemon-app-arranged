// 特性情報セクション


import React from 'react';
import { FaPenFancy } from 'react-icons/fa6';
import { MdCatchingPokemon } from 'react-icons/md';
import type { AbilityObj } from '../../utilities/types/typesUtility';
interface ModalAbilitiesProps {
  abilities: AbilityObj[];
}

const ModalAbilities= ({abilities}:ModalAbilitiesProps) => {
  return (
    <section className='ability maskingTapeStyleBase'>
      <h5 className='abilityTitle title maskingTapeStyleTitle'>特性</h5>
      {/* 内容 */}
      <ul>
        {abilities.map((ability) => {
          return (
            <li className='abilityDetail' key={ability.id}>
              <div className='abilityName'>
                {ability.name}
                {ability.is_hidden ? '（夢）' : ''}
              </div>
              {ability.text.length > 0 ? (
                ability.text.map((txt, txtIndex) => {
                  return (
                    <React.Fragment key={txtIndex}>
                      <div className='abilityText textArea'>
                        <FaPenFancy className='firstMark' />{' '}
                        {txt.text ? txt.text : 'データ未登録'}
                      </div>
                      <div className='abilityVersionArea  versionArea'>
                        <MdCatchingPokemon />
                        {txt.version.map((ver, verIndex) => {
                          return (
                            <span
                              className='abilityTextVersion textVersion'
                              key={verIndex}
                            >
                              {ver.name}
                            </span>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div className='abilityNoText'>特性説明文：データ未登録</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ModalAbilities