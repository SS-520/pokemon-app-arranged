import React, { useImperativeHandle, useRef } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

// 呼び出し関数・型
import type { LsPokemon, MainModalHandle } from '../utilities/types/typesUtility';
import { closeDetail } from '../utilities/function/renderFunction';

// スタイル読み込み
import {} from '../scss/MainModal.scss';

// propsの型設定
interface MainModalProps {
  ref: React.Ref<MainModalHandle>;
  pokemon: LsPokemon;
}

// 親コンポーネントから子コンポーネントにrefを渡す：forwardRef使用
// ⇒React19からはforwardRef非推奨（今回こっち）
// pokemonデータがnullの時と両方の引数を定義
function MainModal({ ref, pokemon }: MainModalProps) {
  console.log('MainModal');
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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
      <section className='pokemonDetail'>
        <h4>{pokemon.name}</h4>
      </section>
    </dialog>
  );
}

export default MainModal;
