import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

const HourglassIcon = ({ size = 40 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6,2v6l4,4l-4,4v6h12v-6l-4-4l4-4V2H6z M16,16.5V20H8v-3.5l4-4L16,16.5z M12,10.5l-4-4V4h8v2.5L12,10.5z"
      fill="white"
    />
  </Svg>
);

export default HourglassIcon;
