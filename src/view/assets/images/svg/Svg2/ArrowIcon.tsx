import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowIconProps {
    width?: number;  
    height?: number; 
    color?: string;  
}

export const ArrowIcon: React.FC<ArrowIconProps> = ({
    width = 24,     
    height = 24,     
    color = "#E0E0E0",
}) => {
    return (
        <Svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
        clipRule="evenodd"
       
      >
        <Path d="M21.883 12l-7.527 6.235L15 19l9-7.521L15 4l-.645.764L21.884 11H0v1h21.883z" />
      </Svg>
    );
};
