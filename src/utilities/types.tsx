// ユーザー定義の型の集積ファイル
// ＊外部から呼び出すのが全体の定義⇒export を付与

// 個々のポケモンのデータ型
export interface PokemonResult {
  name: string;
  url: string;
}

// ポケモンAPIから取得したデータをjsonに直した型
export interface PokemonListResponse {
  count: number; // ポケモンデータの総数
  next: string | null; // 次のページへのURL (文字列、または最終ページの場合は null)
  previous: string | null; // 前のページへのURL (文字列、または最初のページの場合は null)
  results: PokemonResult[]; // ポケモン情報のリスト（上記で定義した PokemonResult 型の配列）
}
