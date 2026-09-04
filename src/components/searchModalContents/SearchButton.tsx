// 検索・リセットボタン

import React from 'react'

const SearchButton = (): React.ReactNode => {
  return (
    <div className='buttonArea'>
      <button className='resetButton'>全リセット</button>
      <button className='searchButton'>検索</button>
    </div>
  )
}

export default SearchButton