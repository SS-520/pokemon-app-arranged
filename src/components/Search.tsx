import React, { useEffect, useImperativeHandle, useRef } from 'react';

// 呼び出し関数・型
import { type MainModalHandle } from '../utilities/types/typesUtility';
import {} from '../utilities/function/searchPokemonFunction';

// アイコン
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoMdHelpCircleOutline } from 'react-icons/io';

// CSS呼び出し
import '../scss/SearchModal.scss';

interface SearchProps {
  ref: React.Ref<MainModalHandle>;
  onClose: () => void;
}

const Search = ({ ref, onClose }: SearchProps) => {
  //
  // 開閉判定の変数設定
  // HTMLDialogElement : <dialog> 要素を操作するメソッド
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /**
   * モーダルを閉じる共通処理
   */
  const searchModalClose = () => {
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
      searchModalClose();
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
  }, []);

  /**
   * ダイアログのバックドロップ（外側）クリック判定
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      searchModalClose();
    }
  };

  // 描画内容
  return (
    <dialog
      ref={dialogRef}
      onCancel={searchModalClose}
      onClick={handleBackdropClick}
      className='searchModal'
      id='searchModal'
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBackdropClick(
            e as unknown as React.MouseEvent<HTMLDialogElement>,
          );
        }
      }}
    >
      <button className='modalCloseButton' onClick={searchModalClose}>
        <IoIosCloseCircleOutline />
      </button>
      <section className='searchSection'>
        <header>
          <h2>検索</h2>
          <IoMdHelpCircleOutline className='helpIcon' />
        </header>
        <section className='searchContents'>
          <dl>
            <dt>キーワード,ID</dt>
            <dd>部分一致、完全一致、前方一致、後方一致</dd>
          </dl>
          <dl>
            <dt>タイプ</dt>
            <dd>OR検索</dd>
            <dd>AND検索（複合タイプ）</dd>
            <dd></dd>
          </dl>
          <dl>
            <dt>地方</dt>
            <dd></dd>
          </dl>
          <dl>
            <dt>バージョン</dt>
            <dd></dd>
          </dl>
          <dl>
            <dt>オスメス差分</dt>
            <dd></dd>
          </dl>
          <button className='searchButton'>検索</button>
        </section>
      </section>
    </dialog>
  );
};

export default Search;
