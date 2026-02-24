// ブラウザのHTML（DOM）と繋げるための「一回こっきりの設定」用ファイル

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// QueryClientを設定
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* QueryClientをアプリ全体に適用 */}
    <QueryClientProvider client={queryClient}>
      <App /> {/* アプリの実態 */}
    </QueryClientProvider>
  </StrictMode>,
);
