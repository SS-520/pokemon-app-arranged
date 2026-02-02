import React, { useEffect, useImperativeHandle, useRef, useState, type RefObject } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

// 呼び出し関数・型
import type { AbilityData, LsPokemon, MainModalHandle, PokedexData, RenderObj } from '../utilities/types/typesUtility';
import { closeDetail } from '../utilities/function/renderFunction';
import { fetchDetails, mergePokemonDetails } from '../utilities/function/mainModalFunction';

// スタイル読み込み
import {} from '../scss/MainModal.scss';
import type { EvoChainDetail, FormsDetail, ItemDetail, PokemonDetail, PokemonSpeciesDetail } from '../utilities/types/typesFetch';
import { renderMainModal } from '../utilities/function/renderMainModal';
import Loading from './Loading';

// propsの型設定
interface MainModalProps {
  ref: React.Ref<MainModalHandle>;
  pokemon: LsPokemon;
  pokedexData: RefObject<PokedexData[]>;
  abilityData: RefObject<AbilityData[]>;
  allData: LsPokemon[];
}

// 親コンポーネントから子コンポーネントにrefを渡す：forwardRef使用
// ⇒React19からはforwardRef非推奨（今回こっち）
// pokemonデータがnullの時と両方の引数を定義
function MainModal({ ref, pokemon, pokedexData, abilityData, allData }: MainModalProps) {
  // App.tsxから図鑑と特性データを受け取る

  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // モーダルの表示内容
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  // useImperativeHandle で 親が子の内部メソッドを呼び出せる
  // useImperativeHandle(プロップスref, 公開関数, アクティブリスト（オプショナル）)
  useImperativeHandle(
    ref,
    () => ({
      // 変数名: () =>{HTMLDialogElementのインスタンスメソッド}  で設定
      // 親側で変数を叩くと子側の機能が発火

      // モーダルを開く
      showModal: () => dialogRef.current?.showModal(),
      // モーダルを閉じる
      closeModal: () => dialogRef.current?.close(),
    }),
    [],
  );

  // モーダルの開閉をuseEffectで管理
  useEffect(() => {
    if (pokemon && dialogRef.current) {
      if (!dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    }
  }, [pokemon]);
  // 時間のかかるAPI通信処理をuseEffect内で実行
  useEffect(() => {
    if (!pokemon) return; // 取得する元データが無かったら終了
    // fetchのコントローラー設定
    const controller = new AbortController();

    // 非同期通信
    const loadModalData = async () => {
      const result:
        | {
            pokemonDetail: PokemonDetail;
            pokemonSpecies: PokemonSpeciesDetail;
            pokemonForms: FormsDetail[];
            pokemonEvoChain: EvoChainDetail;
            pokemonEggItem: ItemDetail;
          }
        | undefined = await fetchDetails(pokemon, controller.signal);

      // undefined⇒何もしない
      if (!result) return;

      // 成功時処理
      // awaitで確実に終わらせてから次へ
      const mergeResult: RenderObj = await mergePokemonDetails(pokemon, result, pokedexData.current, abilityData.current, allData);
      console.log('Fetched data:', result);
      console.log('merge data:', mergeResult);

      // モーダルの中身描画して取得
      const resultContents: React.ReactNode = renderMainModal(pokemon, mergeResult, allData, pokedexData, result.pokemonDetail, result.pokemonSpecies);

      //モーダルの中身をmodalContentにセットして書き換え
      setModalContent(resultContents);
    };
    loadModalData(); // 非同期関数実行
    return () => controller.abort();
  }, [pokemon]);
  // ToDo 結果を受け取るかuseRefの値に詰め直す

  return (
    <dialog
      ref={dialogRef}
      onClick={(_event) => {
        closeDetail(_event, dialogRef);
      }}
      className='mainModal'
      id='mainModal'>
      <button
        className='modalCloseButton'
        onClick={() => {
          dialogRef.current?.close();
        }}>
        <VscChromeClose />
      </button>
      <section className='pokemonDetail'>{modalContent ? modalContent : <Loading />}</section>
    </dialog>
  );
}

export default MainModal;
