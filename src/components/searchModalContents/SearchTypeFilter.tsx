// タイプ検索

import React from 'react'
import { types } from '../../utilities/dataInfo';

const SearchTypeFilter = ():React.ReactNode => {

  // タイプカード生成
  const selectTypes = ():React.ReactNode => {
    return types.map((type) => {
      return (
        <label className='type method' key={type.number}>
          <input type='checkbox' name='typeSearchMode' data-number={type.number}/>
          <img src={type.imgURL} alt={type.name} />
        </label>
      );
    });
  }

  // 描画内容
  return (
    <dl className='areaAppBase'>
      <dt className='areaAppTitle'>タイプ</dt>
      <div className='areaAppContents'>
        <dd>
          <label className='method'>
            <input type='radio' name='typeSearchMode' defaultChecked />
            OR検索
          </label>
          <label className='method'>
            <input type='radio' name='typeSearchMode' />
            AND検索（複合タイプ）
          </label>
        </dd>
        <dd className='selectTypeArea'>
          {selectTypes()}
        </dd>
      </div>
    </dl>
  )
}

export default SearchTypeFilter