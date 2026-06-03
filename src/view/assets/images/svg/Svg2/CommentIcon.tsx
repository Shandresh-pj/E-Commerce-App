import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

const CommentIcon = ({ size = 28 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21,6H3C1.9,6,1,6.9,1,8v9c0,1.1,0.9,2,2,2h3v3l3-3h12c1.1,0,2-0.9,2-2V8C23,6.9,22.1,6,21,6z"
      fill="white"
    />
  </Svg>
);

export default CommentIcon;
