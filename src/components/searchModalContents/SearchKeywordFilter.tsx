// キーワード検索

import React, { useState } from 'react'

// 本体
const SearchKeywordFilter = () => {
  //
  // キーワード検索の状態管理
  const defaultPlaceholder = 'ピカチュウ(名前) または 25(図鑑番号)';
  const [keywordPlaceholder, setKeywordPlaceholder] =
    useState<string>(defaultPlaceholder);

  /**
   * キーワード検索のモード変更
   */
  const changeKeywordMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'searchNameOrDexNo') {
      setKeywordPlaceholder('ピカチュウ(名前) または 25(図鑑番号)');
    } else if (event.target.id === 'searchFormName') {
      setKeywordPlaceholder('アローラ キョダイマックス メガ');
    }
  };


  // 描画内容
  return (
    <dl className='keywordSearch areaAppBase'>
      <dt className='searchTarget areaAppTitle'>名前／図鑑番号</dt>
      <div className='searchOptions areaAppContents'>
        <dd>
          <label className='method'>
            <input
              type='radio'
              name='keywordSearchMode'
              id='searchNameOrDexNo'
              onChange={changeKeywordMode}
              defaultChecked
            />
            名前・図鑑番号
          </label>
          <label className='method'>
            <input
              type='radio'
              name='keywordSearchMode'
              id='searchFormName'
              onChange={changeKeywordMode}
            />
            フォルム名
          </label>
        </dd>
        <input
          type='text'
          id='searchKeyword'
          placeholder={`例：${keywordPlaceholder}`}
        />
      </div>
    </dl>
  )
}

export default SearchKeywordFilter