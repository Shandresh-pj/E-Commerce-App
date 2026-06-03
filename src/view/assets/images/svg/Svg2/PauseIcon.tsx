import React from "react";
import Svg, { Rect } from "react-native-svg";

type Props = {
  size?: number;
};

const PauseIcon = ({ size = 64 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6" y="5" width="4" height="14" fill="white" />
    <Rect x="14" y="5" width="4" height="14" fill="white" />
  </Svg>
);

export default PauseIcon;
