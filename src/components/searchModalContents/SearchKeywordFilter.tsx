// キーワード検索

import React, { useState } from 'react';
import type { SearchConditions } from '../../contexts/SearchConditions';

// propsの型
interface SearchKeywordFilterProps {
  keyword: SearchConditions['keyword'];
  matchType: SearchConditions['keywordMatchType'];
  onKeywordChange: (newKeyword: SearchConditions['keyword']) => void;
  onMatchTypeChange: (
    newMatchType: SearchConditions['keywordMatchType'],
  ) => void;
}

// 本体
const SearchKeywordFilter = ({
  keyword,
  matchType,
  onKeywordChange,
  onMatchTypeChange,
}: SearchKeywordFilterProps): React.ReactNode => {
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
      onMatchTypeChange('name'); // 検索タイプをNameに変更してSearchButtonに渡す情報と連動
      console.log({ matchType });
    } else if (event.target.id === 'searchFormName') {
      setKeywordPlaceholder('アローラ キョダイマックス メガ');
      onMatchTypeChange('form'); // 検索タイプをNameに変更してSearchButtonに渡す情報と連動
      console.log({ matchType });
    }
  };

  // 描画内容
  return (
    <section
      className='areaAppBase searchKeywordArea'
      id='searchKeywordArea'
      role='group'
      aria-labelledby='searchKeywordTitle'
    >
      <h3 className='areaAppTitle keywordTitle' id='searchKeywordTitle'>
        名前／図鑑番号
      </h3>
      <div className='areaAppContents keywordContents'>
        <div role='radiogroup' aria-label='検索対象モード'>
          <label className='method'>
            <input
              type='radio'
              name='keywordSearchMode'
              id='searchNameOrDexNo'
              checked={matchType === 'name'} // 親のmatchTypeが'Name'なら選択状態
              onChange={changeKeywordMode}
            />
            名前・図鑑番号
          </label>
          <label className='method'>
            <input
              type='radio'
              name='keywordSearchMode'
              id='searchFormName'
              checked={matchType === 'form'} // 親のmatchTypeが'Form'なら選択状態
              onChange={changeKeywordMode}
            />
            フォルム名
          </label>
        </div>
        <input
          type='text'
          id='searchKeyword'
          className='searchKeyword'
          aria-label='名前または図鑑番号のキーワード入力'
          placeholder={`例：${keywordPlaceholder}`}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </div>
    </section>
  );
};

export default SearchKeywordFilter;
