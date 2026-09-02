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
  pokemonMap: Map<number, LsPokemon>;  // id情報から即検索可能なMap
  onClose: () => void;
  onSelectPokemon: (pokemon: LsPokemon) => void;  // setSelectPokemonを変更する関数
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
  pokemonMap,
  onClose,
  onSelectPokemon,  // ポケモン切り替え用関数
}: MainModalProps) {
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /**
   * 進化系統や別形態クリック時の切り替え処理（イベント委譲）
   * 対象をクリックしたらselectPokemonを更新してモーダルが再レンダリング
   *  ⇒更新されたselectPokemonをContentsに渡してuseStateの機能＋key属性の機能で再レンダリングさせる
   *  event:「クリックされた」という出来事（どこがクリックされたか、などの情報を含有）
   *  React.MouseEvent<HTMLElement>：HTML要素がクリックされたときの情報が入ると明示
   */
  const handleDetailClick = (event: React.MouseEvent<HTMLElement>) => {
    // クリック位置から一番近い(closet)「[data-id]属性がついたHTML要素」を取得
    //  ⇒クリック位置がどこであっても、data-idが付与されてる要素を捕捉できる

    // (event.target as HTMLElement): クリック対象がHTMLElement型であることを保証（型アサーション）
    const target: HTMLElement | null = (event.target as HTMLElement).closest('[data-id]') as HTMLElement | null;
    if(!target) return  // なければ何もしない
    
    // [data-id]属性から付与されているIDを取得
    //  getAttributeで取得⇒文字列扱い
    const dataId:string | null = target.getAttribute('data-id');
    if (!dataId) return  // data-idが取得できなかったら何もしない
    
    // 文字列→10進数の数値に変換
    const targetId: number = parseInt(dataId, 10);
    if(targetId === pokemon.id) return // 表示中のポケモンなら何もしない

    // 取得した対象のidに対応するポケモンをpokemonMapから取得
    const showPokemon: LsPokemon | undefined = pokemonMap.get(targetId);

    // idが存在⇒親コンポーネントのステートを更新
    // 
    if (showPokemon) {

      // onSelectPokemonが実行されると、親コンポーネントのsetSelectPokemonが実行される
      // ⇒setSelectPokemonが書き換わると、selectPokemonが書き換わる
      // ⇒keyが変更されるのでuseEffectが発火
      // ⇒useEffectが発火すると、MainModalが再レンダリングされる
      // ⇒setSelectPokemonの引数で渡しているshowPokemonがMainModalのpropsとして再セットされる！
      onSelectPokemon(showPokemon);

      // ダイアログ内のスクロール位置を一番上に戻す
      if (dialogRef.current) {
        dialogRef.current.scrollTop = 0;
      }
    } else {
      // 取得できなかったらコンソールに警告
      console.warn(`Pokemon with ID ${targetId} not found in allData.`);
    }
  }


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
      <section className='pokemonDetail' onClick={handleDetailClick}>
        {isModalLoading ? <Loading /> : modalContent}
      </section>
    </dialog>
  );
}

export default MainModal;
