// 性別差分検索

import React from 'react';

import { IoMdMale, IoMdFemale } from 'react-icons/io';

const SearchGenderFilter = (): React.ReactNode => {
  return (
    <section
      className='areaAppBase searchGenderArea'
      id='searchGenderArea'
      role='group'
      aria-labelledby='searchGenderTitle'
    >
      <h3 className='areaAppTitle genderTitle' id='searchGenderTitle'>
        <IoMdMale aria-hidden='true' />
        <IoMdFemale aria-hidden='true' />
        差分
      </h3>
      <div
        className='areaAppContents genderContents'
        role='radiogroup'
        aria-label='性別差分選択'
      >
        <label className='method'>
          <input type='radio' name='gender' defaultChecked />
          全て
        </label>
        <label className='method'>
          <input type='radio' name='gender' /> 差分有
        </label>
        <label className='method'>
          <input type='radio' name='gender' /> 差分無
        </label>
      </div>
    </section>
  );
};

export default SearchGenderFilter;
