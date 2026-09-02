// 野生出現バージョン


import React from 'react'
import type { LsPokemon, PokedexData, PokedexObj } from '../../utilities/types/typesUtility'
import { formatUniqueVersionList } from '../../utilities/function/utilityFunction';

// プロップスの型定義
interface ModalEncountVersionsProps {
  pokedexData:PokedexData[]
  pokedex: PokedexObj
  pokemon: LsPokemon
  isDefault:boolean
}

// 本体
const ModalEncountVersions = ({ pokedexData, pokedex ,pokemon,isDefault}: ModalEncountVersionsProps): React.ReactNode => {
  //  バージョン一覧を取得
  const versions: PokedexData['vGroup'][number]['version'] =
    formatUniqueVersionList(pokedexData);

  // 当該ポケモンの登場バージョンのidだけ抜き出し
  const encountVersions: number[] = pokemon.ve;

  // バージョンidが空ならバージョングループ情報から取ってくる（保険）
  const pokeApp: number[] = pokedex.versionNames.map((version) => {
    return version.id;
  });


  // バージョン一覧を返す関数（）
  const encountVersionList = (
    versions: PokedexData['vGroup'][number]['version'],
    encountVersions: number[],
    pokeApp: number[],
  ): React.ReactNode => {
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
                  //  encountVersionsが空ならpokeAppをから取ってくる
                  const isAppearing =
                    encountVersions.length > 0
                      ? encountVersions.includes(version.id)
                      : pokeApp.includes(version.id);
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

  // 描画内容
  return (
    <dl className='appearanceVersions maskingTapeStyleBase'>
      <dt className='maskingTapeStyleTitle'>野生登場バージョン</dt>
      <div className='ddContainer maskingTapeStyleContents'>
        {encountVersionList(versions, encountVersions,pokeApp)}
      </div>
      {!isDefault && (
        <div>
          <p className='annotation'>
            ※通常／リージョンフォームが登場する全バージョンが表示されます
          </p>
        </div>
      )
    }
  </dl>
  )
}

export default ModalEncountVersions