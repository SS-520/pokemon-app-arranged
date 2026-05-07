import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

// 呼び出し関数・型
import { type MainModalHandle } from '../utilities/types/typesUtility';

// アイコン
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoMdHelpCircleOutline } from 'react-icons/io';
import { IoMdMale, IoMdFemale } from 'react-icons/io';

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

  //
  // キーワード検索の状態管理
  const defaultPlaceholder = 'ピカチュウ(名前) または 25(図鑑番号)';
  const [keywordPlaceholder, setKeywordPlaceholder] =
    useState<string>(defaultPlaceholder);

  /**
   * キーワード検索のモード変更
   * ・
   */
  const changeKeywordMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'searchNameOrDexNo') {
      setKeywordPlaceholder('ピカチュウ(名前) または 25(図鑑番号)');
    } else if (event.target.id === 'searchFormName') {
      setKeywordPlaceholder('アローラ キョダイマックス メガ');
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
          <h2>検索条件</h2>
          <IoMdHelpCircleOutline className='helpIcon' />
          {/* 押下でヘルプモーダル出す */}
        </header>
        <section className='searchContents'>
          <dl className='keywordSearch areaAppBase'>
            <dt className='searchTarget areaAppTitle'>名前／図鑑番号</dt>
            <div className='searchOptions areaAppContents'>
              <dd>
                <label className='method'>
                  <input
                    type='radio'
                    name='keywordSearchMode'
                    id='searchNameOrDexNo'
                    onChange={changeKeywordMode}
                    defaultChecked
                  />
                  名前・図鑑番号
                </label>
                <label className='method'>
                  <input
                    type='radio'
                    name='keywordSearchMode'
                    id='searchFormName'
                    onChange={changeKeywordMode}
                  />
                  フォルム名
                </label>
              </dd>
              <input
                type='text'
                id='searchKeyword'
                placeholder={`例：${keywordPlaceholder}`}
              />
            </div>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>
              <IoMdMale />
              <IoMdFemale />
              差分
            </dt>
            <dd className='areaAppContents'>
              <label className='method'>
                <input type='radio' name='gender' defaultChecked />
                全て
              </label>
              <label className='method'>
                <input type='radio' name='gender' /> 差分有
              </label>
              <label className='method'>
                <input type='radio' name='gender' /> 差分無
              </label>
            </dd>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>タイプ</dt>
            <div className='areaAppContents'>
              <dd>
                <label className='method'>
                  <input type='radio' name='typeSearchMode' defaultChecked />
                  OR検索
                </label>
                <label className='method'>
                  <input type='radio' name='typeSearchMode' />
                  AND検索（複合タイプ）
                </label>
              </dd>
            </div>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>地方</dt>
            <dd className='areaAppContents'></dd>
          </dl>
          <dl className='areaAppBase'>
            <dt className='areaAppTitle'>バージョン</dt>
            <dd className='areaAppContents'></dd>
          </dl>
        </section>
        <div className='buttonArea'>
          <button className='resetButton'>全リセット</button>
          <button className='searchButton'>検索</button>
        </div>
      </section>
    </dialog>
  );
};

export default Search;
