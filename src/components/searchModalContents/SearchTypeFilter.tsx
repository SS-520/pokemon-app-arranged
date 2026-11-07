// タイプ検索

import { types } from '../../utilities/dataInfo';
import type { SearchConditions } from '../../contexts/SearchConditions';

interface SearchTypeFilterProp {
  selectedTypes: SearchConditions['types']; // 選択中のタイプ
  typeMatchType: SearchConditions['typeMatchType']; // 選択中の検索タイプ
  onSelectTypesChange: (newSelectTypes: SearchConditions['types']) => void;
  onTypeMatchTypeChange: (
    newTypeMatchType: SearchConditions['typeMatchType'],
  ) => void;
}

const SearchTypeFilter = ({
  selectedTypes,
  typeMatchType,
  onSelectTypesChange,
  onTypeMatchTypeChange,
}: SearchTypeFilterProp): React.ReactNode => {
  /* 処理関数 */

  // 検索対象選択時のチェック（ハンドラ処理）
  const handleTypeChange = (checkedTypeNumber: number) => {
    // 押されたのは選択済みかチェック（true⇒選択解除、false⇒新規選択）
    //  押したnumberは選択済みに含まれているかの判定で判断
    const isAlreadySelected: boolean =
      selectedTypes.includes(checkedTypeNumber);

    // 選択解除のケース
    if (isAlreadySelected) {
      //  checkedTypeNumberと合致しない選択済みselectedTypesNumberで新規配列を作る（実質typeNumberを元配列から除去）
      const newSelectedTypes: SearchConditions['types'] = selectedTypes.filter(
        (selectedTypesNumber) => selectedTypesNumber !== checkedTypeNumber,
      );

      // 選択済みの配列で検索用変数を更新する
      onSelectTypesChange(newSelectedTypes);
    } else {
      // 新規選択のケース
      if (typeMatchType === 'AND' && selectedTypes.length >= 2) {
        // 複合タイプの時＋３つ目の選択⇒警告を出して追加NG
        return alert('複合タイプの選択は２つまでです。');
      } else {
        // 新規追加処理
        // 直前までの配列=selectedTypes
        // ...selectedTypes: selectedTypesの要素を展開（展開してからcheckedTypeNumberを追加することで新しい配列を作成）
        const newSelectedTypes: SearchConditions['types'] = [
          ...selectedTypes,
          checkedTypeNumber,
        ];

        // 選択済みの配列で検索用変数を更新する
        onSelectTypesChange(newSelectedTypes);
      }
    }
  };

  // 検索モード切り替え時の処理
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 三項演算子で入力値設定
    onTypeMatchTypeChange(event.target.id === 'andSearchType' ? 'AND' : 'OR');

    // OR検索からAND検索モードを切り替えたときに、３つ以上選択していたら選択済みのタイプを全て解除する
    if (event.target.id === 'andSearchType' && selectedTypes.length > 2) {
      alert('３タイプ以上選択されています。\nタイプを再選択してください。');
      onSelectTypesChange([]); // 選択済みタイプを初期化
    }
  };

  // タイプカード生成
  const selectTypes = (): React.ReactNode => {
    return types.map((type) => {
      return (
        <label className='type method' key={type.number}>
          <input
            type='checkbox'
            name='typeSearchMode'
            data-number={type.number}
            checked={selectedTypes.includes(type.number)} // 選択済みの配列に現在のtype.numberが含まれていればチェックtrue
            onChange={() => handleTypeChange(type.number)} // クリック時に発火
          />
          <img src={type.imgURL} alt={type.name} />
        </label>
      );
    });
  };

  // 描画内容
  return (
    <section
      className='areaAppBase searchTypeArea'
      id='searchTypeArea'
      role='group'
      aria-labelledby='searchTypeTitle'
    >
      <h3 className='areaAppTitle typeTitle' id='searchTypeTitle'>
        タイプ
      </h3>
      <div className='areaAppContents typeContents'>
        <div
          className='typeMethodSelectArea'
          role='radiogroup'
          aria-label='検索対象モード'
        >
          <label className='method'>
            <input
              type='radio'
              name='typeSearchMode'
              id='orSearchType'
              checked={typeMatchType === 'OR'}
              onChange={handleModeChange} // 変更処理発火
            />
            OR検索
          </label>
          <label className='method'>
            <input
              type='radio'
              name='typeSearchMode'
              id='andSearchType'
              checked={typeMatchType === 'AND'}
              onChange={handleModeChange} // 変更処理発火
            />
            AND検索（複合タイプ）
          </label>
        </div>
        <div className='selectTypeArea' role='group' aria-label='タイプ選択'>
          {selectTypes()}
        </div>
      </div>
    </section>
  );
};

export default SearchTypeFilter;
