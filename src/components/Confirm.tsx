import React, { useEffect, useRef } from 'react';

import type { setBoolean } from '../utilities/types/typesUtility';
import { storageAvailable } from '../utilities/function/utilityFunction';

import { MdCatchingPokemon } from 'react-icons/md';
import { IoWarningOutline } from 'react-icons/io5';

// スタイル
import '../scss/Confirm.scss';

interface ConfirmProps {
  setIsConfirm: setBoolean;
}
const Confirm = ({ setIsConfirm }: ConfirmProps) => {
  // ローカルストレージが使えるかの判定
  const isLs = storageAvailable('localStorage');

  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // チェックボックスの管理
  const checkRef = useRef<HTMLInputElement | null>(null);

  // コンポーネントが画面に描画された直後に自動でダイアログを開く
  useEffect(() => {
    // showModal() を使うことで、背景を操作不能にする「真のモーダル」として開けるにゃ！
    dialogRef.current?.showModal();
  }, []);

  const confirmClose = () => {
    if (dialogRef.current?.open) {
      // チェックボックスがチェックされているか判定
      if (checkRef.current?.checked) {
        // チェックされている場合、ローカルストレージに保存
        localStorage.setItem('confirm', 'true');
      }

      // requestAnimationFrameの実行はconfirmClose実行時と多少タイミングがずれる
      // ⇒dialogRef.currentがnullになる可能性を考慮
      // この瞬間のdialogRefの値を保持
      const dialog = dialogRef.current;

      // ブラウザの都合のいいタイミングで閉じる
      requestAnimationFrame(() => {
        setIsConfirm(true); // 親コンポーネント側App.tsxの管理フラグをtrueにする
        dialog.close(); // ダイアログを閉じる
      });
    }
  };

  /* 描画内容 */
  return (
    <dialog ref={dialogRef} className='confirm'>
      <h2>
        <IoWarningOutline />
        Attention!
      </h2>
      <section className='attention'>
        <ul>
          <li className='header'>本webアプリについて</li>
          <li className='list'>
            <MdCatchingPokemon className='ball' />
            学習目的で作成したものです。
          </li>
          <li className='list'>
            <MdCatchingPokemon className='ball' />
            初回読み込み時に１～５分ほど時間がかかる場合があります
            <br />
            （通信状況により前後します）
          </li>
          <li className='list'>
            <MdCatchingPokemon className='ball' />
            全世界の有志によって管理されている「ポケモンAPI」を使用しています
            <br />
            そのため、リージョンフォームなどの一部データが混在しているケースがあります
          </li>
          <li className='list'>
            <MdCatchingPokemon className='ball' />
            進化情報など正確なデータが必要な際は、お手数ですが他webサイトをご利用ください
          </li>
        </ul>
        <div className='buttonArea'>
          {isLs ? (
            <React.Fragment>
              <label className='nextTime'>
                <input
                  type='checkbox'
                  name='nextTime'
                  className='nextTimeCheck'
                  required
                  value={'true'}
                  ref={checkRef}
                />
                次回以降は表示しない
              </label>
            </React.Fragment>
          ) : (
            <React.Fragment></React.Fragment>
          )}

          <button className='closeButton' onClick={confirmClose}>
            閉じる
          </button>
        </div>
      </section>
    </dialog>
  );
};

export default Confirm;
