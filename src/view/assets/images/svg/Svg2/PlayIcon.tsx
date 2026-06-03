import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const PlayIcon = ({ size = 64, color = '#fff' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="6,3 20,12 6,21" fill={color} />
  </Svg>
);

export default PlayIcon;
