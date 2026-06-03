import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

const FlipIcon = ({ size = 22, color = '#fff' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 4V10H7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 20V14H17"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 9C19.84 7.36 18.73 5.93 17.29 4.88C15.85 3.83 14.14 3.2 12.36 3.05C10.58 2.9 8.79 3.25 7.19 4.06C5.59 4.87 4.25 6.12 3.32 7.67L1 10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 15C4.16 16.64 5.27 18.07 6.71 19.12C8.15 20.17 9.86 20.8 11.64 20.95C13.42 21.1 15.21 20.75 16.81 19.94C18.41 19.13 19.75 17.88 20.68 16.33L23 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default FlipIcon;
