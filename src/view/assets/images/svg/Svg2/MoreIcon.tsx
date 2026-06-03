import React from "react";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
};

const MoreIcon = ({ size = 28 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="5" r="2" fill="white" />
    <Circle cx="12" cy="12" r="2" fill="white" />
    <Circle cx="12" cy="19" r="2" fill="white" />
  </Svg>
);

export default MoreIcon;
