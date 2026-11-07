// 検索用カスタムフック

// 検索条件の型設定
export interface SearchConditions {
  keywordMatchType: 'name' | 'form'; // ワード検索の条件
  keyword: string;
  genderDiff: 'all' | 'hasDiff' | 'noDiff'; // 性別差分
  types: number[]; // 選択されたタイプID一覧
  typeMatchType: 'AND' | 'OR'; // タイプ検索の条件
  regions: number[]; // 選択された地方ID一覧
  versions: number[]; // 選択されたバージョンID一覧
  generations: number[]; // 初出世代一覧
}

// 検索条件の初期値
export const initialSearchConditions: SearchConditions = {
  keywordMatchType: 'name',
  keyword: '',
  genderDiff: 'all',
  types: [],
  typeMatchType: 'OR',
  regions: [],
  versions: [],
  generations: [],
};
