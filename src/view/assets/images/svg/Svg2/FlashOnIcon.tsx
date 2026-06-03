import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
};

const FlashOnIcon = ({ size = 22 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L4.09 13H11L10.58 22L20 11H13L13 2Z" fill="#FFD60A" />
  </Svg>
);

export default FlashOnIcon;
