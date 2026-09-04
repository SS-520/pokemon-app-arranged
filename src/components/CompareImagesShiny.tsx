import { useState } from 'react';
import type { ImageObj, LsPokemon } from '../utilities/types/typesUtility';

// スタイル
import {} from '../scss/CompareImagesShiny.scss';

// アイコン
import { RxCircleBackslash } from 'react-icons/rx';
import { BsStars } from 'react-icons/bs';
import ToggleSwitch from './common/ToggleSwitch';

// propsの型設定
interface CompareImagesShinyProps {
  images: ImageObj;
  name: LsPokemon['name'];
}
function CompareImagesShiny({ images, name }: CompareImagesShinyProps) {
  // チェック状態を管理するState
  const [isShiny, setIsShiny] = useState<boolean>(false);
  // デフォルト：false⇒通常
  // 変更：true⇒色違い

  // クリック時のハンドラー
  const handleToggle = () => {
    setIsShiny((prev) => !prev);
  };

  // 表示内容
  return (
    <div className='compareShiny'>
      <img
        src={isShiny ? images.shinyImg : images.defaultImg}
        alt={`${isShiny ? '色違い' : '通常'}の${name}の画像`}
        className='compareImg'
      />
      <ToggleSwitch
        isChecked={isShiny}
        onToggle={handleToggle}
        ariaLabel='色違い切り替えトグル'
        beforeIcon={<RxCircleBackslash />}
        afterIcon={<BsStars />}
      />
    </div>
  );
}

export default CompareImagesShiny;
