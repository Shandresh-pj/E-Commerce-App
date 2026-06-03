import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

const ShareIcon = ({ size = 28 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M2.01,21L23,12L2.01,3L2,10l15,2L2,14L2.01,21z"
      fill="white"
    />
  </Svg>
);

export default ShareIcon;
