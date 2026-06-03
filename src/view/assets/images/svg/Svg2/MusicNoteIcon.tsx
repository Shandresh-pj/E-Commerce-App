import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
};

const MusicNoteIcon = ({ size = 14 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12,3v10.55c-0.59-0.34-1.27-0.55-2-0.55c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4V7h4V3H12z"
      fill="white"
    />
  </Svg>
);

export default MusicNoteIcon;
