// 検索・リセットボタン

import React from 'react'
// import { usePokemonData } from '../../contexts/PokemonDataContext'

const SearchButton = (): React.ReactNode => {

  // contextでデータを受け取る
  // const { pokemonAllData, pokedexData } = usePokemonData();

  return (
    <div className='buttonArea'>
      <button className='resetButton'>全リセット</button>
      <button className='searchButton'>検索</button>
    </div>
  )
}

export default SearchButton