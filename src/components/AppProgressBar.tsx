// 進捗バー表示専用コンポーネント
import { useEffect, useState } from 'react';
import { progressNotifier } from '../utilities/function/progressEvent';
import { Box,Typography,LinearProgress } from '@mui/material';

interface AppProgressBarProps {
  isBgLoading: boolean; // バックグラウンド取得中かどうか
}

const AppProgressBar = ({isBgLoading}: AppProgressBarProps) => {

  // 進捗率設定
  const [progress, setProgress] = useState<number>(0);

  // 中継ファイルから進捗を受け取る
  // このコンポーネントが呼び出されたに１度だけsubscribeを登録⇒useEffect
  useEffect(() => {
    // newProgress：emit側から発信された結果（今回は数値）を受け取る
    const unsubscribe = progressNotifier.subscribe((newProgress: number) => {
      
      // 新しい進捗率に書き換える
      setProgress(newProgress); 
      
      // コンポーネントが消える（進捗100%等）
      // ⇒subscribeに登録してる情報解除
      // ⇒メモリリーク防止
      return unsubscribe;
    })
    
  }, []) // マウント時の1回のみ実行
  
    // バックグラウンド取得中でない時は何も描画しない
  if (!isBgLoading) return null;  

  // 描画内容
  return (
    <Box className='progressContainer'>
      <Box className='typographyContainer'>
        <Typography className='labelText'>
          全ポケモンデータ取得中
        </Typography>
        <Typography className='percentageText'>{`${progress}%`}</Typography>
      </Box>
      <LinearProgress
        variant='determinate'
        value={progress}
        className='progressBar'
      />
    </Box>
  )
}

export default AppProgressBar