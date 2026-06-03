import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface ChevronLeftIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  width = 20,
  height = 20,
  color = '#fff',
  style,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
