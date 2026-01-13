import React, { useImperativeHandle, useRef } from 'react';

// 呼び出し関数・型
import type { MainModalHandle } from '../utilities/types/typesUtility';
import { closeDetail } from '../utilities/function/renderFunction';

// スタイル読み込み
import {} from '../scss/MainModal.scss';

// propsの型設定

// 親コンポーネントから子コンポーネントにrefを渡す：forwardRef使用
// ⇒React19からはforwardRef非推奨（今回こっち）
function MainModal({ ref }: { ref: React.Ref<MainModalHandle> }) {
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
      <p>ポケモンの詳細が出るよ</p>
      <button
        onClick={() => {
          dialogRef.current?.close();
        }}>
        閉じる
      </button>
    </dialog>
  );
}

export default MainModal;
