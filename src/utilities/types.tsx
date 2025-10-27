// ユーザー定義の型の集積ファイル
// ＊外部から呼び出すのが全体の定義⇒export を付与

// 個々のポケモンのデータ型
// オブジェクト構造のため interfaceで定義
export interface PokemonResult {
  name: string;
  url: string;
}

// ポケモンAPIから取得したデータをjsonに直した型
// オブジェクト構造のため interfaceで定義
export interface PokemonListResponse {
  count: number; // ポケモンデータの総数
  next: string | null; // 次のページへのURL (文字列、または最終ページの場合は null)
  previous: string | null; // 前のページへのURL (文字列、または最初のページの場合は null)
  results: PokemonResult[]; // ポケモン情報のリスト（上記で定義した PokemonResult 型の配列）
}

/**
/* 各ポケモンの個別データ
*/

// 技の情報を表す型 (例: "scratch", "cut")
interface PokemonMove {
  move: {
    name: string; // 技の名前
    url: string; // 技の詳細URL
  };
}

// ステータスを表す型 (例: HP, Attack, Defense)
interface PokemonStatus {
  base_stat: number; // 基本的なステータス値
  stat: {
    name: string; // ステータスの名前 (hp, attack, defense など)
  };
}

// ポケモン個別の詳細データを表すメインの型
export interface PokemonDetail {
  id: number; // ポケモンID (1, 2, 3...)
  name: string; // ポケモンの名前 (bulbasaur, ivysaur...)
  height: number; // ポケモンの高さ (デシメートル単位)
  weight: number; // ポケモンの重さ (ヘクトグラム単位)
  sprites: {
    front_default: string; // デフォルトの画像URL
  };
  moves: PokemonMove[]; // 覚える技のリスト（Move型の配列）
  stats: PokemonStatus[]; // ステータスのリスト（Stat型の配列）
}

// neverthrow で使用するエラー型
export interface FetchError {
  type: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'PARSE_ERROR';
  message: string;
  status?: number; // HTTPエラーの場合のみ
}
