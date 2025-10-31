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
 *  各ポケモンの個別データ
 *    叩き台：API情報からAIが生成
 *    最終版：実データと検証・より正確な構造に手動でリファイン
 */

// 技の情報を表す型 (例: "scratch", "cut")
interface PokemonMove {
  move: {
    name: string; // 技の名前
    url: string; // 技の詳細URL
  };
  version_group_details: {
    level_learned_at: number; // 覚えるレベル
    move_learn_method: {
      name: string;
      url: string;
    }[]; // 複数ある⇒配列
    order: number | null;
    version_group: {
      name: string; // ソフト名
      url: string;
    };
  };
}

// 種族値（ステータス）を表す型 (例: HP, Attack, Defense)
interface PokemonStatus {
  base_stat: number; // 基本的なステータス値
  effort: number; // 努力値（戦闘で得られるステータス）
  stat: {
    name: string; // ステータスの名前 (hp, attack, defense など)
    url: string;
  };
}

// タイプを表す情報
interface PokemonTypes {
  slot: number; // メインタイプ
  type: {
    name: string; // タイプ種類
    url: string;
  };
}

// 鳴き声
interface PokemonCries {
  latest: string;
  legacy: string;
}

// 特性の情報
interface PokemonAbilities {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

// 過去世代特性に対応
//  PokemonAbilitiesから 'ability' フィールドを除外し（omit）、
//  'ability' フィールドを null を許容する型で再定義(extends)します。
interface PokemonPastAbility extends Omit<PokemonAbilities, 'ability'> {
  // abilityオブジェクト全体がnullを許容
  ability: {
    name: string;
    url: string;
  } | null;
}

// 姿の情報（？）
interface PokemonForms {
  name: string;
  url: string;
}

// ソフト情報
interface PokemonGameIndices {
  game_index: number;
  version: {
    name: string;
    url: string;
  };
}

// ソフト別のアイテム所持確率
interface HeldItemVersionDetails {
  rarity: number;
  version: {
    name: string;
    url: string;
  };
}

// 捕獲時所有アイテム情報
interface PokemonHeldItems {
  item: {
    name: string;
    url: string;
  };
  version_details: HeldItemVersionDetails[];
}

// 過去の特性
interface PokemonPastAbilities {
  abilities: PokemonPastAbility[]; // 過去世代からの変更に対応したextend型
  generation: {
    name: string;
    url: string;
  };
}

// 過去バージョンでのタイプ
interface PokemonPastTypes {
  generation: {
    name: string; // n世代目
    url: string;
  };
  types: PokemonTypes[];
}

// 画像
interface PokemonSprites {
  // shiny：色違い
  // ※雌雄同姿の場合、メス（female）はnull
  front_default: string;
  front_female: string | null;
  front_shiny: string;
  front_shiny_female: string | null;
  back_default: string;
  back_female: string | null;
  back_shiny: string;
  back_shiny_female: string | null;
}

// ポケモン個別の詳細データを表すメインの型
export interface PokemonDetail {
  id: number; // ポケモンID (1, 2, 3...)
  name: string; // ポケモンの名前 (bulbasaur, ivysaur...)
  height: number; // ポケモンの高さ (デシメートル単位)
  weight: number; // ポケモンの重さ (ヘクトグラム単位)
  sprites: PokemonSprites; // ポケモンの画像
  moves: PokemonMove[]; // 覚える技のリスト（Move型の配列）
  stats: PokemonStatus[]; // 種族値のリスト（stats型の配列）
  types: PokemonTypes[]; // ポケモンのタイプ
  abilities: PokemonAbilities[]; // 特性
  base_experience: number; // 倒して得られる経験値
  cries: PokemonCries; // 鳴き声のURL
  forms: PokemonForms[]; // 姿
  game_indices: PokemonGameIndices[]; // ソフト情報
  held_items: PokemonHeldItems[]; // 所持アイテム
  is_default: boolean; // デフォルトの姿かどうか（メガシンカやリージョンフォームはfalse）
  location_area_encounters: string; // 遭遇場所のリンク
  order: number; // 全国図鑑の番号
  past_abilities: PokemonPastAbilities[]; // 過去世代で持っていた特性一覧
  past_types: PokemonPastTypes[]; // 過去世代で持っていたタイプの一覧
}

// neverthrow で使用するエラー型
export interface FetchError {
  type: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'PARSE_ERROR';
  message: string;
  status?: number; // HTTPエラーの場合のみ
}
