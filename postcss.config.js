// プロジェクトのルートディレクトリに作成するファイル
// Sass関連の設定はここに記述
// ≒gulpfile.js
module.exports = {
  plugins: [
    // 1. メディアクエリのソートと結合 (postcss-sort-media-queries)
    // 開発/本番問わず、Sassでネストしたメディアクエリをまとめます
    require('postcss-sort-media-queries')({
      sort: 'mobile-first', // モバイルファーストの順序で並び替えます
    }),

    // 2. CSSの圧縮 (cssnano)
    // NODE_ENV が 'production' (npm run build 実行時) の場合のみ圧縮を有効にします
    process.env.NODE_ENV === 'production' &&
      require('cssnano')({
        // デフォルトのプリセットで最大限に圧縮
        preset: 'default',
      }),

    // filter(Boolean) は、開発時に 'false' となった cssnano の設定を除外するために必要
  ].filter(Boolean),
};
