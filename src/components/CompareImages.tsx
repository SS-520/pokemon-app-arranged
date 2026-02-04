// import React from 'react';
import type { ImageObj, LsPokemon } from '../utilities/types/typesUtility';

// propsの型設定
interface CompareImagesProps {
  images: ImageObj;
  name: LsPokemon['name'];
}
function CompareImages({ images, name }: CompareImagesProps) {
  console.log({ images });
  console.log({ name });
  return <div>CompareImages</div>;
}

export default CompareImages;
