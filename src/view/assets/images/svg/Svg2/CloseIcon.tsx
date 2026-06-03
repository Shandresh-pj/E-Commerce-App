import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const CloseIcon = ({ size = 16, color = '#ff0000' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

export default CloseIcon;
