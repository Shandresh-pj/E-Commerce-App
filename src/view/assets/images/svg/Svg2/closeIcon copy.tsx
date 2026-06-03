import React from 'react';
import Svg, { Path ,G } from 'react-native-svg';

interface CloseIconProps {
    width?: number;  // Optional width prop
    height?: number; // Optional height prop
    color?: string;  // Optional color prop for the icon
}

export const CloseIcon: React.FC<CloseIconProps> = ({
    width = 30,      // Default width
    height = 30,     // Default height
    color = "black", // Default color
}) => {
    return (
        <Svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
      >
        <G stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
          <Path fillRule="nonzero" d="M0 0H24V24H0z" />
          <Path
            stroke="#0C0310"
            strokeWidth={2}
            strokeLinecap="round"
            d="M16.9999 7L7.00001 16.9999"
          />
          <Path
            stroke="#0C0310"
            strokeWidth={2}
            strokeLinecap="round"
            d="M7.00006 7L17 16.9999"
          />
        </G>
      </Svg>
    );
};
