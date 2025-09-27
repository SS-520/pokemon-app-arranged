import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
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
