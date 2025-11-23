// 各種アイテムデータまとめ
// 頻繁に変わるものじゃないのでAPIの情報を事前にまとめておく

import type { BallDetails, TypeDetails } from './typesUtility';

// ボール
export const balls: BallDetails[] = [
  {
    number: 0,
    name: '',
    imgURL: '',
  },
  {
    number: 1,
    name: 'マスターボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  },
  {
    number: 2,
    name: 'ハイパーボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  },
  {
    number: 3,
    name: 'スーパーボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  },
  {
    number: 4,
    name: 'モンスターボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  },
  {
    number: 5,
    name: 'サファリボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safari-ball.png',
  },
  {
    number: 6,
    name: 'ネットボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png',
  },
  {
    number: 7,
    name: 'ダイブボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png',
  },
  {
    number: 8,
    name: 'ネストボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
  },
  {
    number: 9,
    name: 'リピートボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
  },
  {
    number: 10,
    name: 'タイマーボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
  },
  {
    number: 11,
    name: 'ゴージャスボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png',
  },
  {
    number: 12,
    name: 'プレミアボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
  },
  {
    number: 13,
    name: 'ダークボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png',
  },
  {
    number: 14,
    name: 'ヒールボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heal-ball.png',
  },
  {
    number: 15,
    name: 'クイックボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png',
  },
  {
    number: 16,
    name: 'プレシャスボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cherish-ball.png',
  },
  {
    number: 449,
    name: 'ルアーボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lure-ball.png',
  },
  {
    number: 450,
    name: 'レベルボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/level-ball.png',
  },
  {
    number: 451,
    name: 'ムーンボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-ball.png',
  },
  {
    number: 452,
    name: 'ヘビーボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-ball.png',
  },
  {
    number: 453,
    name: 'スピードボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fast-ball.png',
  },
  {
    number: 454,
    name: 'フレンドボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/friend-ball.png',
  },
  {
    number: 455,
    name: 'ラブラブボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/love-ball.png',
  },
  {
    number: 617,
    name: 'ドリームボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dream-ball.png',
  },
  {
    number: 887,
    name: 'ウルトラボール',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/beast-ball.png',
  },
];

// タイプ
export const types: TypeDetails[] = [
  {
    number: 1,
    name: 'ノーマル',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/1.png',
  },
  {
    number: 2,
    name: 'かくとう',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/2.png',
  },
  {
    number: 3,
    name: 'ひこう',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/3.png',
  },
  {
    number: 4,
    name: 'どく',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/4.png',
  },
  {
    number: 5,
    name: 'じめん',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/5.png',
  },
  {
    number: 6,
    name: 'いわ',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/6.png',
  },
  {
    number: 7,
    name: 'むし',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/7.png',
  },
  {
    number: 8,
    name: 'ゴースト',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/8.png',
  },
  {
    number: 9,
    name: 'はがね',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/9.png',
  },
  {
    number: 10,
    name: 'ほのお',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/10.png',
  },
  {
    number: 11,
    name: 'みず',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/11.png',
  },
  {
    number: 12,
    name: 'くさ',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/12.png',
  },
  {
    number: 13,
    name: 'でんき',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/13.png',
  },
  {
    number: 14,
    name: 'エスパー',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/14.png',
  },
  {
    number: 15,
    name: 'こおり',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/15.png',
  },
  {
    number: 16,
    name: 'ドラゴン',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/16.png',
  },
  {
    number: 17,
    name: 'あく',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/17.png',
  },
  {
    number: 18,
    name: 'フェアリー',
    imgURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/18.png',
  },
];
