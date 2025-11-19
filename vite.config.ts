import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// github pagesで公開する際のサブディレクトリ（リポジトリ）名
const repositoryName = '/pokemon-app-arranged/';

// https://vite.dev/config/
export default defineConfig({
  build: {
    // デフォルトは 'dist'
    // package.json > scripts > deploy に「gh-pages -d build」の設定がある場合outDirの設定必要
    outDir: 'build',
  },
  base: repositoryName, // 公開対象のサブディレクトリ名を指定
  plugins: [
    react({
      babel: {
        // reactCompilerを有効にしている箇所↓↓
        plugins: [['babel-plugin-react-compiler']],
        // reactCompilerを有効にしている箇所↑↑
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
