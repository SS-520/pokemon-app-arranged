// 性別差分検索

import React from 'react'

import { IoMdMale, IoMdFemale } from 'react-icons/io';

const SearchGenderFilter = ():React.ReactNode => {
  return (
    <dl className='areaAppBase'>
      <dt className='areaAppTitle'>
        <IoMdMale />
        <IoMdFemale />
        差分
      </dt>
      <dd className='areaAppContents'>
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
      </dd>
    </dl>
  )
}

export default SearchGenderFilter