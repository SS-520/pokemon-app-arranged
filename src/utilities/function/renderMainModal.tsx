/* メインモーダルの表示内容制御するファイル */

import React from 'react';
import { commonImgURL, eggs, types } from '../dataInfo';
import type {
  AbilityObj,
  DiffForms,
  DiffFormsObj,
  DiffFormsSpecies,
  EggDetails,
  EvoObj,
  FlavorObj,
  ImageObj,
  LsPokemon,
  PokedexData,
  PokedexObj,
  RenderObj,
  TypeDetails,
} from '../types/typesUtility';
import { getJaData } from './utilityFunction';
import type { PokemonDetail, PokemonSpeciesDetail } from '../types/typesFetch';
import noImage from '../../img/noImage.png';

// アイコン
import { BsStars } from 'react-icons/bs';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import { PiArrowFatLinesRight } from 'react-icons/pi';
import { FaPenFancy } from 'react-icons/fa6';
import { MdCatchingPokemon } from 'react-icons/md';

// コンポーネント
import CompareImagesShiny from '../../components/CompareImagesShiny';
import CompareImagesAll from '../../components/CompareImagesAll';

/**
// API取得の情報と各種情報を加工・突合する
/*** @name renderMainModal
 *   @function arrow
 *   @param pokemon:LsPokemon 対象基礎情報
 *   @param mergeResult :RenderObj API取得情報加工データ
 *   @param pokedexData :PokedexData[] 図鑑・バージョン情報全般
 *   @param pokemonDetail :PokemonDetail 図鑑・バージョン情報全般
 *   @param pokemonSpecies :PokemonSpeciesDetail 図鑑・バージョン情報全般
 *   @return ReactNode

 */
export const renderMainModal = (
  pokemon: LsPokemon,
  mergeResult: RenderObj,
  pokedexData: PokedexData[],
  pokemonDetail: PokemonDetail,
  pokemonSpecies: PokemonSpeciesDetail,
): React.ReactNode => {
  // 引数を整理
  const image: ImageObj = mergeResult.imgObj;
  const pokedex: PokedexObj = mergeResult.pokedexObj;
  const ability: AbilityObj[] = mergeResult.abilityObj;
  const flavorText: FlavorObj[] = mergeResult.flavorObj;
  const evolution: EvoObj[] = mergeResult.evoObj;
  const variation: DiffFormsObj = mergeResult.variationFormObj;

  // 種族（○○ポケモン）
  const pokemonGenus: PokemonSpeciesDetail['genera'][number] = getJaData<
    PokemonSpeciesDetail['genera'][number]
  >(pokemonSpecies.genera)[0];

  // メインの画像
  const mainImage: string = pokemon.img ? commonImgURL + pokemon.img : noImage;
  const mainImageAltComment: string = pokemon.name ? pokemon.name : 'No Image';

  // タイプ
  const allTypes: TypeDetails[] = types;
  const typeImage = (): React.ReactNode => {
    return pokemon.type.map((type: number) => {
      const pokemonType = allTypes.find((dataType) => dataType.number === type);
      // タイプオブジェクトを組み込んでJSXを作成
      return (
        <img
          className='type'
          src={pokemonType?.imgURL}
          alt={pokemonType?.name}
          key={pokemonType?.number}
        />
      );
    });
  };

  // 登場バージョン（DLC含む）
  //  バージョン一覧を取得
  const versions: PokedexData['vGroup'][number]['version'] =
    formatVersion(pokedexData);
  // 当該ポケモンの登場バージョンのidだけ抜き出し
  const pokeApp: number[] = pokedex.versionNames.map((version) => {
    return version.id;
  });
  const showVersions: React.ReactNode = showVersionList(versions, pokeApp);

  // 生息地方
  const showRegions: React.ReactNode = getAppRegion(pokedex, pokedexData);

  // べビ・幻・伝説判定
  const isBaby = (): React.ReactNode => {
    return (
      <span className={`baby tiles ${pokemonSpecies.is_baby ? 'show' : ''}`}>
        ベイビィ
      </span>
    );
  };
  const isLegend = (): React.ReactNode => {
    return (
      <span
        className={`legend tiles ${pokemonSpecies.is_legendary ? 'show' : ''}`}
      >
        伝説
      </span>
    );
  };
  const isMythic = (): React.ReactNode => {
    return (
      <span
        className={`mythic tiles ${pokemonSpecies.is_mythical ? 'show' : ''}`}
      >
        幻
      </span>
    );
  };

  // サイズ
  const pokemonSize = (): React.ReactNode => {
    return (
      <React.Fragment>
        <div className='height'>体長: {pokemonDetail.height / 10}m</div>
        <div>体重: {pokemonDetail.weight / 10}kg</div>
      </React.Fragment>
    );
  };

  // 卵グループ
  const showEggs: React.ReactNode = setEggGroupList(pokemon);

  // オスメス確率
  const rateGender = (): React.ReactNode => {
    const rate: number = pokemonSpecies.gender_rate;
    if (rate < 0) {
      return <React.Fragment>性別無</React.Fragment>;
    } else {
      const maleRate: number = ((8 - rate) / 8) * 100;
      const femaleRate: number = (rate / 8) * 100;
      return (
        <React.Fragment>
          <div className='genderRate male'>
            <IoMdMale /> {maleRate}%
          </div>
          <div className='genderRate female'>
            <IoMdFemale /> {femaleRate}%
          </div>
        </React.Fragment>
      );
    }
  };

  // オスメス色違いの画像
  const showImg = setImgs(image, pokemon.name);

  // 重ねて比較
  const compareImage = (): React.ReactNode => {
    if (image.femaleImg) {
      return (
        <section className='compareDiff maskingTapeStyleBase'>
          <h5 className='compareDiffTitle maskingTapeStyleTitle'>
            重ねて比較！
          </h5>
          <div className='maskingTapeStyleContents'>
            <CompareImagesAll images={image} name={pokemon.name} />
          </div>
        </section>
      );
    } else if (image.shinyImg) {
      return (
        <section className='compareDiff maskingTapeStyleBase'>
          <h5 className='compareDiffTitle maskingTapeStyleTitle'>
            重ねて比較！
          </h5>
          <div className='maskingTapeStyleContents'>
            <CompareImagesShiny images={image} name={pokemon.name} />
          </div>
        </section>
      );
    } else {
      <React.Fragment></React.Fragment>;
    }
  };

  // 特性
  const showAbility: React.ReactNode = setAbility(ability);

  // 解説文
  const showFlavorText: React.ReactNode = setFlavorText(flavorText);

  // 進化
  const showEvoChain: React.ReactNode = setEvoChain(evolution);

  //
  /* 注釈 */
  // 地方
  const regionAnnotation = () => {
    if (!pokemonDetail.is_default) {
      return (
        <div>
          <p className='annotation'>
            ※通常／リージョンフォームが登場する全地方が表示されます
          </p>
        </div>
      );
    }
  };
  // バージョン
  const versionAnnotation = () => {
    if (!pokemonDetail.is_default) {
      return (
        <div>
          <p className='annotation'>
            ※通常／リージョンフォームが登場する全バージョンが表示されます
          </p>
        </div>
      );
    }
  };
  //  図鑑
  const flavorAnnotation = () => {
    if (!pokemonDetail.is_default) {
      return (
        <p className='annotation'>※通常フォームのテキストが表示されます</p>
      );
    }
  };
  //  進化
  const evoAnnotation = (): React.ReactNode => {
    // 進化有＋メイン形態じゃない場合進化注釈
    if (evolution.length > 1) {
      return (
        <p className='annotation'>
          ※通常／リージョンフォームが混在する場合があります
        </p>
      );
    } else {
      return <React.Fragment></React.Fragment>;
    }
  };

  // 別形態
  const showVariation: React.ReactNode = setVariation(variation);

  // 描写内容（戻り値）
  return (
    <article className={`modalContents ${pokemonSpecies.color.name}`}>
      <header className='header'>
        <div className='nationalPokedex'>全国図鑑 No.{pokemon.pokedex}</div>
        <h4 className='pokemonName'>
          {pokemon.name}{' '}
          <span className='diffName'>{pokemon.difNm ? pokemon.difNm : ''}</span>
        </h4>
      </header>
      <section className='mainIntroduction'>
        <h5 className='mainImage'>
          <img
            src={mainImage}
            alt={`${mainImageAltComment}の画像`}
            className='modalMainImage'
          />
        </h5>
        <p className='genus'>{pokemonGenus ? pokemonGenus.genus : ''}</p>
        <div className='pokemonTypes'>{typeImage()}</div>
        <dl className='appearanceRegions maskingTapeStyleBase'>
          <dt className='maskingTapeStyleTitle'>登場地方</dt>
          <div className='ddContainer maskingTapeStyleContents'>
            {showRegions}
          </div>
          {regionAnnotation()}
        </dl>
        <dl className='appearanceVersions maskingTapeStyleBase'>
          <dt className='maskingTapeStyleTitle'>登場バージョン</dt>
          <div className='ddContainer maskingTapeStyleContents'>
            {showVersions}
          </div>
          {versionAnnotation()}
        </dl>
        <div className='special'>
          {isBaby()}
          {isLegend()}
          {isMythic()}
        </div>
        <div className='genderRates'>{rateGender()}</div>
        <div className='size'>{pokemonSize()}</div>
        <dl className='eggGroup maskingTapeStyleBase'>
          <dt className='maskingTapeStyleTitle'>卵グループ</dt>
          <div className='ddContainer maskingTapeStyleContents'>{showEggs}</div>
        </dl>
      </section>
      <section className='imgDiff maskingTapeStyleBase'>
        <h5 className='diffImgTitle maskingTapeStyleTitle'>比較画像</h5>
        {showImg}
      </section>
      {/* 重ねて画像比較 */}
      {compareImage()}
      <section className='ability maskingTapeStyleBase'>
        <h5 className='abilityTitle title maskingTapeStyleTitle'>特性</h5>
        {showAbility}
      </section>
      <section className='flavor maskingTapeStyleBase'>
        <h5 className='flavorTextTitle title maskingTapeStyleTitle'>
          図鑑解説テキスト
        </h5>
        <ul className='flavorTextDetail'>{showFlavorText}</ul>
        {flavorAnnotation()}
      </section>
      <section className='evolution maskingTapeStyleBase'>
        <h5 className='evolutionTitle title maskingTapeStyleTitle'>
          進化の流れ
        </h5>
        <div className='evolutionDetail'>{showEvoChain}</div>
        {evoAnnotation()}
      </section>
      {showVariation ? (
        // 別フォームがなければ表示しない
        <section className='variation maskingTapeStyleBase'>
          <h5 className='variationTitle title maskingTapeStyleTitle'>
            別フォーム
          </h5>
          <div className='variationDetail'>{showVariation}</div>
        </section>
      ) : (
        <></>
      )}
    </article>
  );
};

/* 切り出し関数 */
// バージョン一覧を取得
const formatVersion = (
  pokedexData: PokedexData[],
): PokedexData['vGroup'][number]['version'] => {
  // 図鑑・バージョン情報をディープコピー
  const pokedexDataCopy: PokedexData[] = structuredClone(pokedexData);

  // 図鑑データからバージョングループを取り出す
  const vGroups: PokedexData['vGroup'] = [...pokedexDataCopy]
    .map((dex) => {
      return dex.vGroup;
    })
    .flat(); // 二重配列にならないよう平坦化

  // バージョン情報だけ抜く
  const getVersions: PokedexData['vGroup'][number]['version'] = [...vGroups]
    .map((vGroup) => {
      return vGroup.version;
    })
    .flat(); // 二重配列にならないよう平坦化

  // id:44,45,46（日本版赤緑青）があったら
  // id:1,2（グローバル赤青）と置き換える
  const japanVersions: PokedexData['vGroup'][number]['version'] = [
    ...getVersions,
  ].flatMap((version) => {
    // グローバル1,2を弾く
    if (version.id === 1 || version.id === 2) return [];

    // 日本赤緑青を0,1,2に上書き
    if (version.id === 44) {
      version.id = 0;
    } else if (version.id === 45) {
      version.id = 1;
    } else if (version.id === 46) {
      version.id = 2;
    }
    return version;
  });

  // 世代、id順にソート
  const sortedVersions: PokedexData['vGroup'][number]['version'] = [
    ...japanVersions,
  ].sort((a, b) => {
    // 第１キー：世代
    if (a.generation !== b.generation) {
      return a.generation - b.generation;
    }

    // 第２キー：id
    return a.id - b.id;
  });

  // 重複削除
  // Set(配列)だとオブジェクトごとに別物判定⇒idを基準にMapで確実に処理
  const uniqueMap = new Map<
    number,
    PokedexData['vGroup'][number]['version'][number]
  >();
  [...sortedVersions].forEach((version) => {
    uniqueMap.set(version.id, version);
  });

  // 配列に戻して返す
  return Array.from(uniqueMap.values());
};

// 地方一覧列挙＋登場地方列挙
const getAppRegion = (pokedex: PokedexObj, pokedexData: PokedexData[]) => {
  // 地方名一覧を取得
  const regions: PokedexData['region'][] = [...pokedexData].map((data) => {
    return data.region;
  });

  // 重複削除
  const uniqueRegionMap = new Map<number, PokedexData['region']>();
  [...regions].forEach((region) => {
    uniqueRegionMap.set(region.id, region);
  });

  // 重複を除いた地方一覧をMapから配列に戻す
  const uniqueRegions: PokedexData['region'][] = Array.from(
    uniqueRegionMap.values(),
  );

  // 表示element
  return uniqueRegions.map((region) => {
    const isRegion: boolean = pokedex.regionNames.includes(region.name);
    return (
      <dd
        className={`regionName tiles ${isRegion ? 'show' : ''}`}
        key={region.id}
      >
        {region.name}
      </dd>
    );
  });
};

// 登場バージョン列挙
const showVersionList = (
  versions: PokedexData['vGroup'][number]['version'],
  pokeApp: number[],
) => {
  // 1. データを世代ごとにversionsをグループ化する
  const groupedVersions: Record<
    number,
    {
      id: number;
      name: string;
      generation: number;
    }[]
  > = versions.reduce(
    (accumulator, version) => {
      if (!accumulator[version.generation]) {
        // 蓄積データに[gen]の箱がない
        // ⇒新規の空配列作成
        accumulator[version.generation] = [];
      }
      // 蓄積配列にversionオブジェクトを突っ込んで返す
      accumulator[version.generation].push(version);
      return accumulator;
    },
    {} as Record<number, PokedexData['vGroup'][number]['version']>, // 初期値の型を明示,
  );

  // 2. グループ化されたデータを元にレンダリング
  return (
    <React.Fragment>
      {/* 世代別にループ */}
      {Object.entries(groupedVersions).map(
        ([generation, generationVersions]) => (
          <dd
            data-generation={generation}
            className={`generations gene${generation}`}
            key={Number(generation)}
          >
            <span className='generationNumber'>第{generation}世代</span>
            <span className='generationGroup'>
              {/* 世代内のオブジェクトでループ */}
              {generationVersions.map((version) => {
                // 登場バージョンに該当する？
                const isAppearing = pokeApp.includes(version.id);
                return (
                  <span
                    key={version.id}
                    data-version={version.id}
                    className={`version tiles ${isAppearing ? 'show' : ''}`}
                  >
                    {version.name}
                  </span>
                );
              })}
            </span>
          </dd>
        ),
      )}
    </React.Fragment>
  );
};

// 卵グループ列挙
const setEggGroupList = (pokemon: LsPokemon): React.ReactNode => {
  // 卵グループ一覧取得
  const eggGroup: EggDetails[] = eggs;
  return eggGroup.map((egg) => {
    const isEgg: boolean = pokemon.egg.includes(egg.number);
    return (
      <dd key={egg.number} className={`eggName tiles ${isEgg ? 'show' : ''}`}>
        {egg.name}
      </dd>
    );
  });
};

// オスメス色違いの画像
const setImgs = (
  images: ImageObj,
  name: LsPokemon['name'],
): React.ReactNode => {
  // オスメス差分

  if (images.femaleImg && images.shinyFemaleImg) {
    // オスメス＋それぞれ色違いの画像でオブジェクト

    return (
      <React.Fragment>
        <div className='defaultImg'>
          <figure className='detail male'>
            <figcaption>
              <IoMdMale />
            </figcaption>
            <img src={images.defaultImg} alt={`${name}・オスの画像`} />
          </figure>
          <figure className='detail female'>
            <figcaption>
              <IoMdFemale />
            </figcaption>
            <img src={images.femaleImg} alt={`${name}・メスの画像`} />
          </figure>
        </div>
        <hr />
        <div className='shinyImg'>
          <figure className='shiny male'>
            <figcaption>
              <BsStars />
              <IoMdMale />
            </figcaption>
            <img src={images.shinyImg} alt={`${name}・オスの色違い画像`} />
          </figure>
          <figure className='shiny female'>
            <figcaption>
              <BsStars />
              <IoMdFemale />
            </figcaption>
            <img
              src={images.shinyFemaleImg}
              alt={`${name}・メスの色違い画像`}
            />
          </figure>
        </div>
      </React.Fragment>
    );
  } else if (images.defaultImg !== '') {
    return (
      <React.Fragment>
        <div className='commonImg'>
          <figure className='detail male'>
            <figcaption>
              <IoMdMale />
              <IoMdFemale />
            </figcaption>
            <img src={images.defaultImg} alt={`${name}の画像`} />
          </figure>
          <figure className='shiny male'>
            <figcaption>
              <BsStars /> <IoMdMale />
              <IoMdFemale />
            </figcaption>
            <img src={images.shinyImg} alt={`${name}の色違い画像`} />
          </figure>
        </div>
      </React.Fragment>
    );
  } else {
    // 画像がない場合
    <React.Fragment>
      <div className='commonImg'>
        <figure className='detail male'>
          <figcaption>
            <IoMdMale />
            <IoMdFemale />
          </figcaption>
          <img src={noImage} alt={`未登録の${name}の画像`} />
        </figure>
        <figure className='shiny male'>
          <figcaption>
            <BsStars /> <IoMdMale />
            <IoMdFemale />
          </figcaption>
          <img src={noImage} alt={`未登録の${name}の色違い画像`} />
        </figure>
      </div>
    </React.Fragment>;
  }
};

// 特性表示
const setAbility = (abilities: AbilityObj[]): React.ReactNode => {
  // 途中で解説文かあるかで処理分岐
  return (
    <ul>
      {abilities.map((ability) => {
        return (
          <li className='abilityDetail' key={ability.id}>
            <div className='abilityName'>
              {ability.name}
              {ability.is_hidden ? '（夢）' : ''}
            </div>
            {ability.text.length > 0 ? (
              ability.text.map((txt, txtIndex) => {
                return (
                  <React.Fragment key={txtIndex}>
                    <div className='abilityText textArea'>
                      <FaPenFancy className='firstMark' />{' '}
                      {txt.text ? txt.text : 'データ未登録'}
                    </div>
                    <div className='abilityVersionArea  versionArea'>
                      <MdCatchingPokemon />
                      {txt.version.map((ver, verIndex) => {
                        return (
                          <span
                            className='abilityTextVersion textVersion'
                            key={verIndex}
                          >
                            {ver.name}
                          </span>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <div className='abilityNoText'>特性説明文：データ未登録</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// 解説テキスト表示
const setFlavorText = (flavorTextes: FlavorObj[]) => {
  if (flavorTextes.length > 0) {
    return (
      <React.Fragment>
        {flavorTextes.map((text) => {
          return (
            <React.Fragment key={text.text}>
              <li className='flavorTextArea textArea'>
                <div className='flavorText'>
                  <FaPenFancy className='firstMark' />{' '}
                  {text.text ? text.text : 'データ未登録'}
                </div>
                <div className='flavorTextVersionArea versionArea'>
                  <MdCatchingPokemon />
                  {text.version.map((ver, verIndex) => (
                    <span
                      className='flavorTextVersion textVersion'
                      key={verIndex}
                    >
                      {ver.name}
                    </span>
                  ))}
                </div>
              </li>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  } else {
    return (
      <div className='flavorTextArea'>
        <div className='flavorText noText'>
          <FaPenFancy />
          図鑑説明文：データ未登録
        </div>
      </div>
    );
  }
};

// 進化系統
const setEvoChain = (evolutions: EvoObj[]) => {
  if (evolutions.length > 1) {
    // 進化有
    // 進化分岐の有無判定
    let evoBranch = 'straight';
    evolutions.map((evo, index) => {
      const preLevel = index > 0 ? evolutions[index - 1] : null;
      if (evo.level === preLevel?.level) {
        evoBranch = 'branch';
      }
    });
    return (
      <React.Fragment>
        {evolutions.map((evo, index) => {
          // 前後周との進化段階比較
          const preLevel = index > 0 ? evolutions[index - 1] : null;
          const nextLevel = index > 0 ? evolutions[index + 1] : null;

          // 同じ段階があるかないか判定
          let onlyLevel = '';
          if (preLevel?.level === evo.level) {
            onlyLevel = 'notOnly';
          } else if (nextLevel?.level === evo.level) {
            onlyLevel = 'notOnly';
          } else {
            onlyLevel = 'only';
          }

          // 接続記号を設定
          let connector = null;
          if (preLevel) {
            // 2周目以降はコネクタを挟む
            connector = (
              <span
                className={`connecter level${evo.level} ${onlyLevel} ${evoBranch}`}
              >
                <PiArrowFatLinesRight />
              </span>
            );
          }
          return (
            <React.Fragment key={evo.id}>
              {connector}
              <figure
                className={`evoPokemon level${evo.level} ${onlyLevel} ${evoBranch}`}
              >
                <figcaption className='evoForm'>
                  {preLevel?.level !== evo.level ? evo.evoForm : ''}
                </figcaption>
                <img
                  className='evoImg'
                  src={commonImgURL + evo.img}
                  alt={`${evo.name}の画像`}
                />
                <figcaption className='name'>{evo.name}</figcaption>
              </figure>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  } else {
    // 進化無：evolutions.length=1⇒本人だけ
    return <React.Fragment>進化無し</React.Fragment>;
  }
};

// 別形態
const setVariation = (variation: {
  variationResults: DiffFormsSpecies[];
  formsResults: DiffForms[];
}): React.ReactNode => {
  // 引数を分解
  const variations: DiffFormsSpecies[] = variation.variationResults;
  const forms: DiffForms[] = variation.formsResults;

  // variationResultsとformsResultsの両方がある場合
  if (variations.length > 0 && forms.length > 0) {
    return (
      <React.Fragment>
        <div className='groupVariation'>
          {variations.map((variation, varIndex) => (
            <figure className='form' data-id={variation.id} key={varIndex}>
              <figcaption className='formName'>{variation.formName}</figcaption>
              <img
                src={commonImgURL + variation.img}
                className='formImg'
                alt={`${variation.formName}の画像`}
              />
            </figure>
          ))}
        </div>
        <hr />
        <div className='groupForm'>
          {forms.map((form, formIndex) => (
            <figure className='form' data-id={form.order} key={formIndex}>
              <figcaption className='formName'>{form.formName}</figcaption>
              <img
                src={commonImgURL + form.img}
                className='formImg'
                alt={`${form.formName}の画像`}
              />
            </figure>
          ))}
        </div>
      </React.Fragment>
    );
  } else if (variations.length > 0) {
    return (
      <div className='groupVariation'>
        {variations.map((variation, varIndex) => (
          <figure className='form' data-id={variation.id} key={varIndex}>
            <figcaption className='formName'>{variation.formName}</figcaption>
            <img
              src={
                variation.img !== '' ? commonImgURL + variation.img : noImage
              }
              alt={`${variation.formName}の画像`}
              className='formImg'
            />
          </figure>
        ))}
      </div>
    );
  } else if (forms.length > 0) {
    return (
      <div className='groupForm'>
        {forms.map((form, formIndex) => (
          <figure className='form' data-id={form.order} key={formIndex}>
            <figcaption className='formName'>{form.formName}</figcaption>
            <img
              src={form.img !== '' ? commonImgURL + form.img : noImage}
              className='formImg'
              alt={`${form.formName}の画像`}
            />
          </figure>
        ))}
      </div>
    );
  } else {
    return;
  }
};
