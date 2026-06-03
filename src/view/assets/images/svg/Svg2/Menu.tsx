import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface MenuProps {
  width?: number;          
  height?: number;         
  strokeColor?: string;    // Optional stroke color
}

export const Menu: React.FC<MenuProps> = ({
  width = 25,             
  height = 25,             
  strokeColor = "black", // Default stroke color
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <G clipPath="url(#clip0_37_4)">
        <Path d="M5 10H35" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 20H35" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 30H35" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <Defs>
        <ClipPath id="clip0_37_4">
          <Rect width="40" height="40" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
