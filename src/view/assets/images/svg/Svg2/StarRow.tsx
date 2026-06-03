import React from "react";
import { View } from "react-native";
import { Svg, Path } from "react-native-svg";

const StarFull = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill={color}
    />
  </Svg>
);

const StarHalf = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Path
      d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
      fill={color}
    />
  </Svg>
);

const StarEmpty = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Path
      d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
      fill={color}
    />
  </Svg>
);

type Props = {
  rating: number;
};

const StarRow = ({ rating }: Props) => (
  <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const color = rating >= i ? "#008a00" : rating >= i - 0.5 ? "#008a00" : "#e0e0e0";
      if (rating >= i) return <StarFull key={i} color={color} />;
      if (rating >= i - 0.5) return <StarHalf key={i} color={color} />;
      return <StarEmpty key={i} color={color} />;
    })}
  </View>
);

export default StarRow;
