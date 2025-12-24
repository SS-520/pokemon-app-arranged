// fetch処理用ユーザー定義の型の集積ファイル

// 個々のポケモンのデータ型
// オブジェクト構造のため interfaceで定義
export interface NameAndURL {
  name: string; // 名称
  url: string; // APIのURL
}

// ポケモンAPIから取得したデータをjsonに直した型
// オブジェクト構造のため interfaceで定義
export interface PokemonListResponse {
  count: number; // ポケモンデータの総数
  next: string | null; // 次のページへのURL (文字列、または最終ページの場合は null)
  previous: string | null; // 前のページへのURL (文字列、または最初のページの場合は null)
  results: NameAndURL[]; // ポケモン情報のリスト（上記で定義した NameAndURL 型の配列）
}

/**
 *  各ポケモンの個別データ
 *    叩き台：API情報からAIが生成
 *    最終版：実データと検証・より正確な構造に手動でリファイン
 */

// 技の情報を表す型 (例: "scratch", "cut")
interface PokemonMove {
  move: NameAndURL;
  version_group_details: {
    level_learned_at: number; // 覚えるレベル
    move_learn_method: NameAndURL[]; // 複数ある⇒配列
    order: number | null;
    version_group: NameAndURL;
  };
}

// 種族値（ステータス）を表す型 (例: HP, Attack, Defense)
interface PokemonStatus {
  base_stat: number; // 基本的なステータス値
  effort: number; // 努力値（戦闘で得られるステータス）
  stat: NameAndURL;
}

// タイプを表す情報
interface PokemonTypes {
  slot: number; // メインタイプ
  type: NameAndURL;
}

// 鳴き声
interface PokemonCries {
  latest: string;
  legacy: string;
}

// 特性の情報
interface PokemonAbilities {
  ability: NameAndURL;
  is_hidden: boolean;
  slot: number;
}

// 過去世代特性に対応
//  PokemonAbilitiesから 'ability' フィールドを除外し（omit）、
//  'ability' フィールドを null を許容する型で再定義(extends)します。
interface PokemonPastAbility extends Omit<PokemonAbilities, 'ability'> {
  // abilityオブジェクト全体がnullを許容
  ability: NameAndURL | null;
}

// ソフト情報
interface PokemonGameIndices {
  game_index: number;
  version: NameAndURL;
}

// ソフト別のアイテム所持確率
interface HeldItemVersionDetails {
  rarity: number;
  version: NameAndURL;
}

// 捕獲時所有アイテム情報
interface PokemonHeldItems {
  item: NameAndURL;
  version_details: HeldItemVersionDetails[];
}

// 過去の特性
interface PokemonPastAbilities {
  abilities: PokemonPastAbility[]; // 過去世代からの変更に対応したextend型
  generation: NameAndURL;
}

// 過去バージョンでのタイプ
interface PokemonPastTypes {
  generation: NameAndURL;
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
  forms: NameAndURL[]; // 姿
  game_indices: PokemonGameIndices[]; // ソフト情報
  held_items: PokemonHeldItems[]; // 所持アイテム
  is_default: boolean; // デフォルトの姿かどうか（メガシンカやリージョンフォームはfalse）
  location_area_encounters: string; // 遭遇場所のリンク
  order: number; // 全国図鑑の番号
  past_abilities: PokemonPastAbilities[]; // 過去世代で持っていた特性一覧
  past_types: PokemonPastTypes[]; // 過去世代で持っていたタイプの一覧
}

// ポケモンの詳細データと前後20匹ずつのAPIのURLを格納した型
// 型
export type PokemonDetailAndURL = Pick<PokemonListResponse, 'next' | 'previous'> & { pokemonDetailData: PokemonDetail[] };

export interface PokemonSpeciesDetail {
  base_happiness: number; // モンボゲットにおける最大幸福度
  capture_rate: number; // 基本捕獲率
  // API内の検索色区分
  color: NameAndURL;
  // 卵グループ
  egg_groups: NameAndURL[];
  // 図鑑解説文
  flavor_text_entries: {
    flavor_text: string;
    language: NameAndURL;
    version: NameAndURL;
  }[];
  form_descriptions: unknown[]; //形態説明
  forms_switchable: boolean; // 形態変化の有無
  gender_rate: number; // メスの確率（n/8%,性別無は-1）
  // 種（○○ポケモン）
  genera: {
    genus: string;
    language: NameAndURL;
  };
  // 初登場世代
  generation: NameAndURL;
  // 成長速度
  growth_rate: NameAndURL;
  // 生息地
  habitat: NameAndURL | null;
  has_gender_differences: boolean; // オスメス差分
  hatch_counter: number; // 孵化サイクル数
  id: number; // 識別番号
  is_baby: boolean; // ベビーポケモン？
  is_legendary: boolean; // 伝説ポケモン？
  is_mythical: boolean; // 幻のポケモン？
  name: string; // 英名
  // 各国名
  names: {
    language: NameAndURL;
    name: string;
  }[];
  order: number; // 並び順
  // 地方別図鑑番号
  pokedex_numbers: {
    entry_number: number;
    pokedex: NameAndURL;
  }[];
  // API内の検索形状区分
  shape: NameAndURL;
}

/*
 * Fetch処理で使用する型
 */

// neverthrow で使用するエラー型
export interface FetchError {
  type: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'UNKNOWN_ERROR' | 'BODY_READ_ERROR';
  message: string;
  status?: number; // HTTPエラーの場合のみ
  context?: {
    url?: string;
    responseSnippet?: string;
    validationIssues?: string[];
  };
}
