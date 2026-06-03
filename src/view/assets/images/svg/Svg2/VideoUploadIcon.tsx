import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const VideoUploadIcon = ({ size = 20, color = '#fff' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.888L15 14v-4z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polygon
      points="3,7 3,17 15,17 15,7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default VideoUploadIcon;
