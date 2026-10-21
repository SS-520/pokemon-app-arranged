// データ取得進捗バー表示用イベントエミッター
// 進捗状況の共有・中継機能

import type { ProgressListener } from "../types/typesUtility";

// 進捗バーのリスナー一覧をSetで管理（重複防止＆高速）
const listeners = new Set<ProgressListener>();

// 進捗状況を受信・発信するオブジェクト
export const progressNotifier = {
  // 1. 実処理側（loadPokemonFunction）が進捗を通知する関数
  // emit:発信であることを定義
  // listenersに対して進捗率を順次渡す
  emit: (progress: number): void => {  // 進捗率（数値）を受け取り
    // 受け取った進捗率をSetに登録されているすべてのリスナーに渡す
    listeners.forEach((listener)=>listener(progress)); 
  },

  // 2. 表示される進捗バー通知を聞くための登録関数
  subscribe: (listener: ProgressListener):(()=>void) => {  // リスナー関数を受け取り
    // Setに新しくリスナーを登録⇒emitが動いたときにprogress情報を共有する対象に追加
    listeners.add(listener); 

    // クリーンアップ用の関数を返す
    return () => {  // クリーンアップ用関数
      listeners.delete(listener); // リスナー削除（Setから削除）
    };
  },
};