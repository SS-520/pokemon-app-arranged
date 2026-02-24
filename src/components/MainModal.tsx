import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

// 呼び出し関数・型
import type {
  AbilityData,
  LsPokemon,
  MainModalHandle,
  ModalFetchResult,
  PokedexData,
  RenderObj,
} from '../utilities/types/typesUtility';
import { loadModalData } from '../utilities/function/mainModalFunction';
import { renderMainModal } from '../utilities/function/renderMainModal';

// スタイル読み込み
import {} from '../scss/MainModal.scss';
import Loading from './Loading';

// アイコン
import { IoIosCloseCircleOutline } from 'react-icons/io';

// propsの型設定
interface MainModalProps {
  ref: React.Ref<MainModalHandle>;
  pokemon: LsPokemon;
  pokedexData: PokedexData[];
  abilityData: AbilityData[];
  allData: LsPokemon[];
  onClose: () => void;
}

// 親コンポーネントから子コンポーネントにrefを渡す：forwardRef使用
// ⇒React19からはforwardRef非推奨（今回こっち）
// pokemonデータがnullの時と両方の引数を定義

// key属性の導入により、pokemon変更時のリセット用useEffectは削除
function MainModal({
  ref,
  pokemon,
  pokedexData,
  abilityData,
  allData,
  onClose,
}: MainModalProps) {
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /**
   * モーダルを閉じる共通処理
   */
  const handleClose = () => {
    // dialogRef.current?.close();
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }

    // モーダルが消える瞬間のガタつきを抑え
    // ブラウザに無理のないタイミングで状態を切り替えてもらう
    requestAnimationFrame(() => {
      onClose();
    });
  };

  // useImperativeHandle で 親が子の内部メソッドを呼び出せる
  // useImperativeHandle(プロップスref, 公開関数, アクティブリスト（オプショナル）)
  useImperativeHandle(ref, () => ({
    // 変数名: () =>{HTMLDialogElementのインスタンスメソッド}  で設定
    // 親側で変数を叩くと子側の機能が発火

    // モーダルを開く
    showModal: () => {},
    // モーダルを閉じる
    closeModal: () => {
      handleClose();
    },
  }));

  /**
   * モーダル起動制御
   */
  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      // フォーカスによる自動スクロール移動を防止
      // preventScroll: true を使用して初回トップ戻りを防止
      dialogRef.current.focus({ preventScroll: true });
    }
  }, [pokemon]);

  /**
   * ダイアログのバックドロップ（外側）クリック判定
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      handleClose();
    }
  };

  /**
   * 非同期処理
   */
  // 時間のかかるAPI通信処理をtanstackで実行
  const {
    data,
    isLoading: isModalLoading,
    isError: isModalError,
    error: modalError,
    refetch,
  } = useQuery<{ result: ModalFetchResult; mergeResult: RenderObj }>({
    queryKey: ['pokemon', pokemon.id],
    queryFn: ({ signal }) =>
      loadModalData(pokemon, pokedexData, abilityData, allData, signal),
  });

  // 一旦画面描画後にエラー処理
  useEffect(() => {
    if (isModalError) {
      console.error('Error fetching modal data:', modalError);
      refetch();
    }
  }, [isModalError, modalError, refetch]);

  // 表示内容を格納する変数を用意
  let modalContent: React.ReactNode = <></>; // 初期値

  // 取得中はレンダリング内容が<Loading />になる
  if (isModalLoading || !data || !data.result || !data.mergeResult) {
    modalContent = <Loading />;
  } else {
    // 絶対resultとmergeResultが存在する状態
    // ⇒modalContentにレンダリングする対象を詰める
    const { result: modalResult, mergeResult: modalMergeResult } = data;

    modalContent = renderMainModal(
      pokemon,
      modalMergeResult,
      pokedexData,
      modalResult.pokemonDetail,
      modalResult.pokemonSpecies,
    );
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className='mainModal'
      id='mainModal'
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBackdropClick(
            e as unknown as React.MouseEvent<HTMLDialogElement>,
          );
        }
      }}
    >
      <button className='modalCloseButton' onClick={handleClose}>
        <IoIosCloseCircleOutline />
      </button>
      <section className='pokemonDetail'>
        {isModalLoading ? <Loading /> : modalContent}
      </section>
    </dialog>
  );
}

export default MainModal;
