import React, { useEffect, useImperativeHandle, useRef, useState, type RefObject } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

// 呼び出し関数・型
import type { AbilityData, LsPokemon, MainModalHandle, PokedexData, RenderObj } from '../utilities/types/typesUtility';
// import { closeDetail } from '../utilities/function/renderFunction';
import { fetchDetails, mergePokemonDetails, useScrollLock } from '../utilities/function/mainModalFunction';

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
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // モーダルの表示内容
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  // 背景スクロール固定用ステート
  const [isLocked, setIsLocked] = useState(false);

  /**
   * 背景スクロールロックの適用
   * useScrollLock(isLocked) により、isLockedがtrueの間bodyをfixedにする。
   * 解除時にwindow.scrollToで元の位置に戻る前提の実装。
   */
  const scrollPosRef = useRef(0);
  useScrollLock(isLocked, scrollPosRef);

  // useImperativeHandle で 親が子の内部メソッドを呼び出せる
  // useImperativeHandle(プロップスref, 公開関数, アクティブリスト（オプショナル）)
  useImperativeHandle(ref, () => ({
    // 変数名: () =>{HTMLDialogElementのインスタンスメソッド}  で設定
    // 親側で変数を叩くと子側の機能が発火

    // モーダルを開く
    showModal: () => {
      // スクロール位置を確定させてからロックをかける
      setIsLocked(true);
    },
    // モーダルを閉じる
    closeModal: () => {
      handleClose();
    },
  }));

  /**
   * モーダル起動制御
   * preventScroll: true を使用して初回トップ戻りを防止
   */
  useEffect(() => {
    if (isLocked && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      // フォーカスによる自動スクロール移動を防止
      dialogRef.current.focus({ preventScroll: true });
    }
  }, [isLocked]);

  // モーダルの開閉をuseEffectで管理
  useEffect(() => {
    if (pokemon && dialogRef.current) {
      if (!dialogRef.current.open) {
        setIsLocked(true);
      }
    }
  }, [pokemon]);

  //
  // 時間のかかるAPI通信処理をuseEffect内で実行
  useEffect(() => {
    console.log('mainModal start');
    // ・ポケモンが選択されていない場合
    // ・モーダルの中身がある場合
    // ⇒何もしない

    if (!pokemon || modalContent) return;

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

      // undefined or 処理中止の号令（aborted）⇒何もしない
      if (!result || controller.signal.aborted) return;

      // 成功時処理
      // awaitで確実に終わらせてから次へ
      const mergeResult: RenderObj = await mergePokemonDetails(pokemon, result, pokedexData.current, abilityData.current, allData);
      console.log('Fetched data:', result);
      console.log('merge data:', mergeResult);

      // モーダルの中身描画して取得
      const resultContents: React.ReactNode = renderMainModal(pokemon, mergeResult, pokedexData, result.pokemonDetail, result.pokemonSpecies);

      //モーダルの中身をmodalContentにセットして書き換え
      setModalContent(resultContents);
    };

    // 非同期関数実行
    loadModalData();

    console.log('mainModal end');

    // クリーンアップ処理
    return () => {
      controller.abort();
      setModalContent(null);
    };
  }, [pokemon]);

  /**
   * ポケモン変更時にコンテンツをクリア
   */
  useEffect(() => {
    setModalContent(null);
  }, [pokemon]);

  /**
   * モーダルを閉じる共通処理
   * setIsOpen(false) を呼ぶ⇒ useScrollLock 内部の解除ロジック（位置復元）を発火
   */
  const handleClose = () => {
    // dialogRef.current?.close();
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    setIsLocked(false); // useScrollLock内のscrollToが発火し元の位置に戻る
    setModalContent(null); // モーダルの中身を空にする
  };

  /**
   * ダイアログのバックドロップ（外側）クリック判定
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      handleClose();
    }
  };

  // ポケモン未選択時はレンダリングしない
  if (!pokemon) return null;

  return (
    <dialog ref={dialogRef} onCancel={handleClose} onClick={handleBackdropClick} className='mainModal' autoFocus={false} id='mainModal' tabIndex={-1}>
      <button className='modalCloseButton' onClick={handleClose}>
        <VscChromeClose />
      </button>
      <section className='pokemonDetail'>{modalContent ? modalContent : <Loading />}</section>
    </dialog>
  );
}

export default MainModal;
