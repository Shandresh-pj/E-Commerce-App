import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'

interface LocationIconProps {
  width?: number
  height?: number
  color?: string
  outerCircleColor?: string
  pinColor?: string
  innerCircleColor?: string
}

export const LocationIcon: React.FC<LocationIconProps> = ({
  width = 20,
  height = 20,
  color,
  outerCircleColor = '#FFFFFF',
  pinColor = '#FFFFFF',
  innerCircleColor = '#000000',
}) => {
  const finalOuterColor = color || outerCircleColor
  const finalPinColor = color || pinColor
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Outer Circle */}
      <Path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        fill={finalOuterColor}
      />
      {/* Pin/Marker shape for location */}
      <Path
        d="M12 8a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4z"
        fill={finalPinColor}
      />
      {/* Small circle inside the pin */}
      <Circle
        cx="12"
        cy="12"
        r="1.5"
        fill={innerCircleColor}
      />
    </Svg>
  )
}
