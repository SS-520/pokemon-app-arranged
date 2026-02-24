/* メインモーダルに表示する情報を取得する処理 */

import type { Result } from 'neverthrow';
import type {
  EvoChainDetail,
  FetchError,
  FormsDetail,
  ItemDetail,
  NameAndURL,
  PokemonDetail,
  PokemonSpeciesDetail,
} from '../types/typesFetch';
import type {
  AbilityData,
  AbilityObj,
  DiffForms,
  DiffFormsObj,
  DiffFormsSpecies,
  EvoObj,
  EvoProcess,
  FlavorInfo,
  FlavorObj,
  ImageObj,
  LsPokemon,
  ModalFetchResult,
  PokedexData,
  PokedexObj,
  RenderObj,
} from '../types/typesUtility';
import { getPokemonData } from './loadPokemonFunction';
import { alertError } from './fetchFunction';
import {
  getAllJaData,
  getEndID,
  getJaData,
  getVersions,
} from './utilityFunction';
import { commonImgURL } from '../dataInfo';

/* メインの流れ */
export const loadModalData = async (
  pokemon: LsPokemon,
  pokedexData: PokedexData[],
  abilityData: AbilityData[],
  allData: LsPokemon[],
  signal: AbortSignal,
) => {
  // fetchDetailsを呼び出してポケモンの詳細データを取得
  const result: ModalFetchResult = await fetchDetails(pokemon, signal);

  // undefined⇒エラーを返してMainModal.tsx側でcatchしてrefetch
  if (!result) throw new Error('データ取得に失敗');

  // 処理中止の号令（aborted）⇒エラーを返してMainModal.tsx側でcatchしてrefetch
  if (signal.aborted) throw new Error('処理中止');

  // 成功時処理
  // awaitで確実に終わらせてから次へ
  const mergeResult: RenderObj = await mergePokemonDetails(
    pokemon,
    result,
    pokedexData,
    abilityData,
    allData,
  );

  console.log({ result, mergeResult });

  return { result, mergeResult };
};

/* 各情報の取得 */
// APIで表示対象のポケモン情報取得
/*** @name fetchDetails
 *   @function arrow async/await
 *   @param pokemon:LsPokemon 表示対象基礎データ
 *   @param signal:AbortSignal fetch操作を止めるシグナル
 *   @return Promise<PokemonDetail,PokemonSpeciesDetail,FormsDetail[]>
 */
export const fetchDetails = async (
  pokemon: LsPokemon,
  signal: AbortSignal,
): Promise<
  | {
      pokemonDetail: PokemonDetail;
      pokemonSpecies: PokemonSpeciesDetail;
      pokemonForms: FormsDetail[]; // 形態は配列！
      pokemonEvoChain: EvoChainDetail;
      pokemonEggItem: ItemDetail;
    }
  | undefined
> => {
  // ⇒ポケモンAPIから最新データを取得（基本情報）
  const pokemonDetails: Result<PokemonDetail[], FetchError> = await getPokemonData<PokemonDetail>([pokemon.id], 'pokemon', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonDetails.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonDetails);
    return; // 関数実行終了
  }
  // 1体ずつのデータなのでindex0を取得した非配列に格納
  const pokemonDetail: PokemonDetail = pokemonDetails.value[0];

  //
  // ⇒ポケモンAPIから最新データを取得（種類別情報）
  const pokemonSpeciesResult: Result<PokemonSpeciesDetail[], FetchError> = await getPokemonData<PokemonSpeciesDetail>([pokemon.sp], 'pokemon-species', signal);
  if (pokemonSpeciesResult.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonSpeciesResult);
    return; // 関数実行終了
  }
  // 1体ずつのデータなのでindex0を取得した非配列に格納
  const pokemonSpecies: PokemonSpeciesDetail = pokemonSpeciesResult.value[0];

  //
  // ⇒ポケモンAPIから最新データを取得（形態別情報）
  const pokemonFormResult: Result<FormsDetail[], FetchError> = await getPokemonData<FormsDetail>(getEndID(pokemonDetail.forms), 'pokemon-form', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonFormResult.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonFormResult);
    return; // 関数実行終了
  }
  // 複数ある場合があるので配列のまま
  const pokemonForms: FormsDetail[] = pokemonFormResult.value;

  //
  // ⇒ポケモンAPIから最新データを取得（進化情報）
  const pokemonEvoChainResult: Result<EvoChainDetail[], FetchError> = await getPokemonData<EvoChainDetail>(getEndID([pokemonSpecies.evolution_chain]), 'evolution-chain', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonEvoChainResult.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonEvoChainResult);
    return; // 関数実行終了
  }
  // 1体ずつのデータなのでindex0を取得した非配列に格納
  const pokemonEvoChain: EvoChainDetail = pokemonEvoChainResult.value[0];

  //
  // ⇒ポケモンAPIから最新データを取得（孵化アイテム）
  let itemId: number[] = [0];
  if (pokemonEvoChain.baby_trigger_item) {
    itemId = getEndID([pokemonEvoChain.baby_trigger_item]);
  }

  const pokemonEggItemResult: Result<ItemDetail[], FetchError> = await getPokemonData<ItemDetail>(itemId, 'item', signal);
  // 一連のfetch中のエラーここで最終処理
  if (pokemonEggItemResult.isErr()) {
    // 画面にエラー内容表示
    alertError(pokemonEggItemResult);
    // return; エラーでも続ける
  }
  // 1体ずつのデータなのでindex0を取得した非配列に格納
  // pokemonEggItemResultが成功値なら値を返す
  // pokemonEggItemResultがエラーでもnullを返す
  // ※ItemDetail自体がユニオン型でnullを許容済
  const pokemonEggItem: ItemDetail = pokemonEggItemResult.isOk() ? pokemonEggItemResult.value[0] : null;

  return {
    pokemonDetail,
    pokemonSpecies,
    pokemonForms,
    pokemonEvoChain,
    pokemonEggItem,
  };
};

// API取得の情報と各種情報を加工・突合する
/*** @name mergePokemonDetails
 *   @function arrow
 *   @param pokemon:LsPokemon 基礎情報
 *   @param fetchResult : API取得結果
 *             {
                pokemonDetail: PokemonDetail;
                pokemonSpecies: PokemonSpeciesDetail;
                pokemonForms: FormsDetail[];
                } 
 *   @param pokedexCurrent:PokedexData[] 図鑑・バージョン情報配列
 *   @param abilityCurrent: AbilityData[] 特性情報配列
 *   @param allData: LsPokemon[] ポケモン全基礎データ
 *   @return Promise<PokemonDetail,PokemonSpeciesDetail,FormsDetail[]>
 */
export const mergePokemonDetails = (
  pokemon: LsPokemon,
  fetchResult: {
    pokemonDetail: PokemonDetail;
    pokemonSpecies: PokemonSpeciesDetail;
    pokemonForms: FormsDetail[];
    pokemonEvoChain: EvoChainDetail;
    pokemonEggItem: ItemDetail;
  },
  pokedexCurrent: PokedexData[],
  abilityCurrent: AbilityData[],
  allData: LsPokemon[],
): RenderObj => {
  console.log({ pokemon });
  console.log({ pokedexCurrent });
  console.log({ abilityCurrent });
  // fetchResultの中身を分離
  const detail: PokemonDetail = fetchResult.pokemonDetail;
  const species: PokemonSpeciesDetail = fetchResult.pokemonSpecies;
  const forms: FormsDetail[] = fetchResult.pokemonForms;
  const evoChain: EvoChainDetail = fetchResult.pokemonEvoChain;
  const eggItem: ItemDetail = fetchResult.pokemonEggItem;
  console.log({ detail });
  console.log({ species });
  console.log({ forms });
  console.log({ evoChain });

  // オスメス・色違いの画像整理
  const imgObj: ImageObj = formatGenderImg(detail.sprites);

  // 出現ソフト
  const pokedexObj: PokedexObj = setVersion(pokemon, pokedexCurrent);

  // 特性
  const abilityObj: AbilityObj[] = setAbility(detail.abilities, abilityCurrent, pokedexCurrent).flat();

  // 解説文取得
  const flavorObj: FlavorObj[] = setFlavorText(species.flavor_text_entries, pokedexCurrent);

  // 各種形態
  const variationFormObj: DiffFormsObj = setForm(pokemon, species.varieties, forms, detail, allData);

  // 進化の流れ
  const evoObj: EvoObj[] = setEvoChain(pokemon, evoChain.chain, eggItem, allData);

  // 加工データを返す
  return {
    imgObj,
    pokedexObj,
    abilityObj,
    flavorObj,
    variationFormObj,
    evoObj,
  };
};

// 表示可能な画像を取得する関数
// オスメス・色違い
/*** @name formatGenderImg
 * @function arrow
 * @param sprites:PokemonDetail['sprites']
 * @returns :obj
              {
                defaultImg: string;
                femaleImg: string | null;
                shinyImg: string;
                shinyFemaleImg: string | null;
                }
 * home > front_default > showdown の順に確認
 * ※official-artworkはメス差分の登録がないのでhomeメイン
 */
const formatGenderImg = (sprites: PokemonDetail['sprites']): ImageObj => {
  // 返すデータ定義
  let defaultImg: string = '';
  let femaleImg: string | null = '';
  let shinyImg: string = '';
  let shinyFemaleImg: string | null = '';
  // メインのデータチェック

  if (sprites.other.home.front_default && sprites.other.home.front_shiny) {
    // homeのデータある？（defaultと色違い）
    defaultImg = sprites.other.home.front_default;
    femaleImg = sprites.other.home.front_female;
    shinyImg = sprites.other.home.front_shiny;
    shinyFemaleImg = sprites.other.home.front_shiny_female;
  } else if (sprites.front_default && sprites.front_shiny) {
    // 直下のデータある？（defaultと色違い）
    defaultImg = sprites.front_default;
    femaleImg = sprites.front_female;
    shinyImg = sprites.front_shiny;
    shinyFemaleImg = sprites.front_shiny_female;
  } else if (sprites.other.showdown.front_default && sprites.other.showdown.front_shiny) {
    // showdownのデータある？（defaultと色違い）
    defaultImg = sprites.other.showdown.front_default;
    femaleImg = sprites.other.showdown.front_female;
    shinyImg = sprites.other.showdown.front_shiny;
    shinyFemaleImg = sprites.other.showdown.front_shiny_female;
  }

  return {
    defaultImg,
    femaleImg,
    shinyImg,
    shinyFemaleImg,
  };
};

// 登場バージョン（DLC含む）の突合
/*** @name formatGenderImg
 * @function arrow
 * @param sprites:PokemonDetail['sprites']
 * @returns 
   {
    regionNames, // 登場地方名一覧
    versionNames, // 登場バージョン一覧
   };
 */

const setVersion = (pokemon: LsPokemon, pokedexese: PokedexData[]): PokedexObj => {
  // 登場バージョンを取得
  const appearanceVersionsNum: number[] = pokemon.region;

  // 登場バージョンの概要配列取得
  const appearanceVersions: PokedexData[] = [...pokedexese].filter((pokedex) => appearanceVersionsNum.includes(pokedex.id));

  // 地方名を取得
  const regionNameDuplication: string[] = [...appearanceVersions].map((version) => {
    return version.region.name;
  });
  // 重複削除（return値1）
  const regionNames: string[] = [...new Set(regionNameDuplication)];

  //
  // 該当ポケモンの登場バージョングループを取得
  const flatVersionGroupsDuplication: PokedexData['vGroup'] = [...appearanceVersions]
    .map((version) => {
      return version.vGroup;
    })
    .flat(); // 二重配列になるので平坦化して解消

  // バージョングループからバージョンだけ取得＋平坦化＋ソート
  // getVersionsの結果が空配列の場合が削除⇒flatMap使用

  // 登場バージョングループidを総取得
  const versionGroupIdArray: number[] = flatVersionGroupsDuplication.map((vgroup) => vgroup.id);
  const versionNames = getVersions(pokedexese, versionGroupIdArray);

  return {
    regionNames, // 登場地方名一覧
    versionNames, // 登場バージョン一覧
  };
};

// 所持特性の情報整理
/*** @name setAbility
 * @function arrow
 * @param Abilities:PokemonDetail['abilities']
 * @param abilityCurrent:AbilityData[]
 * @returns obj[]
            {
              id: number;
              is_hidden: boolean;
              name: string;
              text: {
                text: string;
                version: {
                  id: number;
                  name: string;
                  generation: number;
                }[];
              }[];
            }[]
 */
const setAbility = (abilities: PokemonDetail['abilities'], abilityCurrent: AbilityData[], pokedexese: PokedexData[]): AbilityObj[] => {
  // ポケモンの所持特性の必要情報を抽出
  const formatAbilityData: {
    id: number;
    is_hidden: boolean;
  }[] = [...abilities].map((ability) => {
    return {
      id: getEndID([ability.ability])[0],
      is_hidden: ability.is_hidden,
    };
  });

  // ポケモンの特性情報と合致する特性情報を取得
  // 量が多いのでMap変換して捜査しやすくする
  const abilityMap: Map<number, AbilityData> = new Map([...abilityCurrent].map((abi) => [abi.id, abi]));

  // 対象ポケモンの特性を全特性データから抽出
  // ※結果を配列として扱う
  const targetAbilities = formatAbilityData
    .map((data) => {
      // const matchedAbility: AbilityData = abilityMap.get(data.id)!; // 対象は絶対ある
      const matchedAbility: AbilityData = abilityMap.get(data.id)!; // 対象は絶対ある
      const uniqueAbilityTextes: FlavorInfo[] = mergeText(matchedAbility.flavor_text_entries);

      // バージョングループidからバージョン情報も取得して追加
      const formatAbilities: {
        text: string;
        version: {
          id: number;
          name: string;
          generation: number;
        }[];
      }[] = uniqueAbilityTextes.map((text) => {
        const versionNames = getVersions(pokedexese, text.version_group);
        return {
          text: text.flavor_text,
          version: versionNames,
        };
      });

      // 戻す情報を詰める
      const result = {
        id: data.id,
        is_hidden: data.is_hidden,
        name: matchedAbility.name,
        text: formatAbilities,
      };
      return result;
    })
    .flat(); // 二重配列になっているので平坦化;

  return targetAbilities;
};

// フレーバーテキストの重複を統合＋バージョングループも統合
/*** @name setAbility
 * @function arrow
 * @param entries:FlavorInfo[]
 * @returns obj FlavorInfo[]
 */
const mergeText = (entries: FlavorInfo[]): FlavorInfo[] => {
  // 重複チェックのためのMap作成
  const map = new Map<string, FlavorInfo>();

  // 引数配列全部に対して処理
  entries.forEach((entry) => {
    // 重複チェック対象のテキストを取得
    const text = entry.flavor_text;

    if (map.has(text)) {
      // mapにテキスト存在してる

      // mapに保存済みの「テキストが同じ既出データ」を取得
      const exist = map.get(text)!;

      // ・既存のvgとこの周のvgを統合してversion_groupを更新する
      // ・textは既存(exist)のまま
      // 上記2点の処理を行ってmapの情報を上書き
      // Map<重複確認対象string:text,FlavorInfo{text:exist,version_group:更新内容}>
      map.set(text, { ...exist, version_group: [...exist.version_group, ...entry.version_group] });
    } else {
      // mapにテキスト存在してない
      // ⇒新規に登録
      map.set(text, { ...entry, version_group: [...entry.version_group] });
    }
  });
  // Mapのデータを配列に再変換して返す
  return Array.from(map.values());
};

// 解説文のセット
/*** @name setFlavorText
 * @function arrow
 * @param textex:PokemonSpeciesDetail['flavor_text_entries'] フレーバーテキストのみ渡す
 * @param pokedexCurrent:PokedexData[] 図鑑・バージョンデータ
 * @returns 
   {
    regionNames, // 登場地方名一覧
    versionNames, // 登場バージョン一覧
   };
 */
const setFlavorText = (textex: PokemonSpeciesDetail['flavor_text_entries'], pokedexes: PokedexData[]): FlavorObj[] => {
  // フレーバーテキストから日本語のみを抽出
  // 重複テキストはgetAllJaData内で統合・一意化済み
  const jaTextes: {
    flavor_text: string;
    id: number[];
  }[] = getAllJaData(textex);

  // 図鑑・バージョン情報からバージョン情報だけ取得・ソート
  const versionDuplication: PokedexData['vGroup'][number]['version'] = pokedexes
    .map((pokedex) => {
      return pokedex.vGroup
        .map((vg) => {
          return vg.version; //バージョン情報のみ返す
        })
        .flat();
    })
    .flat();
  // 重複削除（オブジェクトなのでMapを使う）
  const allVersionMap = new Map<number, PokedexData['vGroup'][number]['version'][number]>();
  [...versionDuplication].forEach((version) => {
    allVersionMap.set(version.id, version);
  });
  const allVersion = Array.from(allVersionMap.values());

  // 日本語テキストのバージョンと一致するバージョンを取得
  const result = jaTextes.map((text) => {
    const versions: {
      id: number;
      name: string;
      generation: number;
    }[] = text.id.map((textId) => {
      // バージョン配列の中からidがテキストのidと一致するものを探す
      return allVersion.find((version) => version.id === textId)!; // 合致するのは絶対ある
    });
    // テキストとバージョン情報を詰める
    return {
      text: text.flavor_text,
      version: versions,
    };
  });
  // 詰めた情報を返す
  return result;
};

// 別形態の管理ID取得
/*** @name setForm
 * @function arrow
 * @param pokemon:LsPokemon ポケモン基礎データ
 * @param variation:PokemonSpeciesDetail['varieties'] 各種形態
 * @param forms:FormsDetail[] 多種形態情報（アンノーンなど）
 * * @param pokemon:LsPokemon[] ポケモン全基礎データ
 * @returns obj
              {
                variationResults: DiffFormsSpecies[];
                formsResults: DiffForms[];
              }
 */
const setForm = (pokemon: LsPokemon, variation: PokemonSpeciesDetail['varieties'], forms: FormsDetail[], detail: PokemonDetail, allData: LsPokemon[]): DiffFormsObj => {
  // 形態違いの紹介
  //
  // 処理
  //
  // それぞれの結果をいれる箱を用意
  let variationResults: DiffFormsSpecies[] = [];
  let formsResults: DiffForms[] = [];

  // 1. PokemonSpeciesDetail['varieties']内の別形態
  if (variation.length > 1) {
    // ２つ以上ある前提の処理
    // LsPokemonのIDと照合＋管理idが異なるものだけ抽出
    const diffFormsSpecies: PokemonSpeciesDetail['varieties'] = variation.filter((variate) => getEndID([variate.pokemon])[0] !== pokemon.id);

    // 別形態の管理idだけ抽出して返す
    const idResults: number[] = diffFormsSpecies.map((form) => {
      return getEndID([form.pokemon])[0];
    });

    // id配列を基に該当するallDataを抜き出す
    // ピックしたいidを集合（Set）に変換
    const idSet: Set<number> = new Set(idResults);
    // 検索対象オブジェクト配列allDataに対して捜査
    const searchResult: LsPokemon[] = allData.filter((data) => idSet.has(data.id));

    variationResults = searchResult.map((result) => {
      return {
        id: result.id, // 管理id
        formName: result.difNm ? result.difNm : '通常形態', // 名前
        img: result.img ? result.img : '', // 画像
      };
    });
  }

  // 1. formの中に複数形態ある場合
  if (forms.length > 1) {
    // 形態全てに処理
    const diffForms = forms.map((form) => {
      // 形態名取得
      const formName: {
        language: NameAndURL;
        name: string;
      } = getJaData(form.form_names)[0];

      // 画像
      const imgUrl = form.sprites.front_default ? form.sprites.front_default.split(commonImgURL)[1] : '';

      // デフォルト名（英名）
      let formDefaultName: string = form.form_name;
      if (pokemon.id === 869) {
        // マホミル：英名のform_nameは'-sweetを取る'
        formDefaultName = formDefaultName.replace('-sweet', '');
      }
      // 戻り値
      return {
        order: form.form_order,
        formName: formName ? formName.name : formDefaultName,
        img: imgUrl,
      };
    });
    formsResults = diffForms.sort((a, b) => {
      return a.order - b.order;
    });
  }

  return {
    variationResults,
    formsResults,
    isDefault: detail.is_default,
  };
};

// 進化の流れ整理
/*** @name setEvoChain
 * @function arrow
 * @param pokemon:LsPokemon ポケモン基礎データ
 * @param evoChain:EvoChainDetail['chain'] 進化の流れ
 * @param eggItem:ItemDetail アイテムデータ
 * @param pokemon:LsPokemon[] ポケモン全基礎データ
 * @returns EvoObj[]
 */
const setEvoChain = (pokemon: LsPokemon, evoChain: EvoChainDetail['chain'], eggItem: ItemDetail, allData: LsPokemon[]): EvoObj[] => {
  // 進化の流れの整理
  const result: EvoProcess[] = []; // 結果を入れる箱
  const depts: number = 1; // 階層番号
  // evoChainから個体情報だけ抽出
  const evoResult: EvoProcess[] = getEvoSpecies(evoChain, depts, result);

  // 表示対象の個体情報を取得
  const mainData: EvoProcess = evoResult.find((result) => getEndID([result.species])[0] === pokemon.sp)!; // pokemonを基にデータ取得⇒絶対ある

  // 孵化アイテムの名前取得
  let eggItemName: string = '';
  if (eggItem) {
    eggItemName = getJaData(eggItem.names)[0].name;
  }

  // 各進化の流れを加工・整理
  const processResult: EvoObj[] = evoResult.map((result) => {
    let is_main: boolean;
    let evoForm: string;
    let item: string = '';
    const formId: number = getEndID([result.species])[0];

    // 各段階の名称をセット
    if (formId === pokemon.sp) {
      // 表示対象の場合
      is_main = true;
      evoForm = '　';
    } else {
      // 対象以外
      is_main = false;
      if (result.level < mainData.level) {
        evoForm = '進化前';
      } else if (result.level > mainData.level) {
        evoForm = '進化先';
      } else {
        evoForm = '別分岐';
      }
    }

    // 孵化アイテムがあるベビーポケモン
    if (result.is_baby) {
      item = eggItemName;
    }

    // 種族番号から通常個体の情報取得
    //  LsPokemon['sp']をキーとしたマップを活用
    //
    // 結果をMapに累積しない⇒
    // この関数のスコープ内だけで有効な変数を用意
    let minIdPokemon: LsPokemon | null = null;
    for (const data of allData) {
      // formIdと一致しなかったらこの周はスキップ
      if (formId !== data.sp) continue;

      // minIdPokemonの中身が未登録か、現在のアイテムdataの ID が既存の ID より小さい場合に更新
      if (!minIdPokemon || data.id < minIdPokemon.id) {
        minIdPokemon = data;
      }
    }

    return {
      id: formId, // 種族番号
      is_main: is_main,
      evoForm: evoForm,
      level: result.level,
      is_baby: result.is_baby,
      eggItem: item,
      name: minIdPokemon ? minIdPokemon.name! : '',
      img: minIdPokemon ? minIdPokemon.img! : '',
    };
  });

  // 加工結果を並べ替えて返す
  return [...processResult].sort((a, b) => {
    // べビポケを先頭に
    if (a.is_baby !== b.is_baby) {
      return a.is_baby ? -1 : 1;
    }

    // 階層順
    if (a.level !== b.level) {
      return a.level - b.level;
    }

    // 上記以外⇒id順
    return a.id - b.id;
  });
};

// 進化系統の再帰処理用機能
function getEvoSpecies(evoData: EvoChainDetail['chain'], depts: number, result: EvoProcess[] = []) {
  // メイン階層にspeciesがある⇒取得
  if (evoData.species) {
    const getInfo: EvoProcess = {
      species: { ...evoData.species },
      is_baby: evoData.is_baby, // ベイポケ？
      level: depts, // n階層目
    };

    result.push(getInfo);
  }

  // 下層以下にspeciesがあれば取得
  // 再帰的に捜査
  if (evoData.evolves_to && Array.isArray(evoData.evolves_to)) {
    // 数が予測できない（筆頭：ブイズ）のでforEachで回す
    evoData.evolves_to.forEach((nextForm) => {
      getEvoSpecies(nextForm, depts + 1, result);
    });
  }
  return result;
}
