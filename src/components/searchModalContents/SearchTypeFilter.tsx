// タイプ検索

import React, { useState } from 'react'
import { types } from '../../utilities/dataInfo';

const SearchTypeFilter = ():React.ReactNode => {

  /* 処理関数 */
  // 検索モードの状態（複合検索がtrue）
  const [isAndSearch, setIsAndSearch] = useState<boolean>(false);

  // 選択中タイプのid配列
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);

  // 検索対象選択時のチェック（ハンドラ処理）
  const handleTypeChange = (typeNumber: number) => {
    
    // 押されたのは選択済みかチェック（true⇒選択解除、false⇒新規選択）
    //  押したnumberは選択済みに含まれているかの判定で判断
    const isAlreadySelected: boolean = selectedTypes.includes(typeNumber);

    // 選択解除のケース
    if (isAlreadySelected) {
      // prevArray:選択済みの配列（直前までのselectedTypesの中身）
      //  typeNumberと合致しない選択済みnumberで新規配列を作る（実質typeNumberを基配列から除去）
      setSelectedTypes((prevArray: number[])=> prevArray.filter(selectedTypeNumber => selectedTypeNumber !== typeNumber))
    } else {
      // 新規選択のケース
      if(isAndSearch && selectedTypes.length >= 2) {
        // 複合タイプの時＋３つ目の選択⇒警告を出して追加NG
        return alert('複合タイプの選択は２つまでです。');
      }else{
        // 新規追加処理
        // prevArray:直前までの配列（selectedTypesの中身）
        // ...prevArray: prevArrayの要素を展開（展開してからtypeNumberを追加することで新しい配列を作成）
        setSelectedTypes((prevArray: number[])=> [...prevArray, typeNumber]);
      }
    }
  }

  // 検索モード切り替え時の処理
  const handleModeChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    setIsAndSearch(event.target.id === 'andSearchType');

    // OR検索からAND検索モードを切り替えたときに、３つ以上選択していたら選択済みのタイプを全て解除する
    if (event.target.id === 'andSearchType' && selectedTypes.length > 2) {
      alert('３タイプ以上選択されています。\nタイプを再選択してください。');
      setSelectedTypes([]); // 選択済みタイプを初期化
    }
  }
  

  // タイプカード生成
  const selectTypes = ():React.ReactNode => {
    return types.map((type) => {
      return (
        <label className='type method' key={type.number}>
          <input
            type='checkbox'
            name='typeSearchMode'
            data-number={type.number}
            checked={selectedTypes.includes(type.number)} // 選択済みの配列に現在のtype.numberが含まれていればチェックtrue
            onChange={() => handleTypeChange(type.number)}  // クリック時に発火
          />
          <img src={type.imgURL} alt={type.name} />
        </label>
      );
    });
  }

  // 描画内容
  return (
    <dl className='areaAppBase searchTypeArea' id='searchTypeArea'>
      <dt className='areaAppTitle typeTitle'>タイプ</dt>
      <div className='areaAppContents typeContents'>
        <dd className='typeMethodSelectArea'>
          <label className='method'>
            <input type='radio'
              name='typeSearchMode'
              id='orSearchType'
              checked={!isAndSearch}  // isAndSearchがfalse（orSearchTypeが選択）ならチェック（初期状態）
              onChange={handleModeChange} // 変更処理発火
            />
            OR検索
          </label>
          <label className='method'>
            <input
              type='radio'
              name='typeSearchMode'
              id='andSearchType'
              checked={isAndSearch} // isAndSearchがtrue（andSearchTypeが選択）ならチェック
              onChange={handleModeChange}  // 変更処理発火
            />
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