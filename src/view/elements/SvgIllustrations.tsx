import React from 'react'
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg'

export interface IllustrationProps {
  size?: number
  isDark?: boolean
  style?: any
}

// 1. Empty Cart Illustration
export const EmptyCartIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="cartBgGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? '0.3' : '0.15'} />
        <Stop offset="100%" stopColor="#8B5CF6" stopOpacity={isDark ? '0.1' : '0.05'} />
      </SvgGradient>
      <SvgGradient id="cartGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F6C453" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgGradient>
    </Defs>

    {/* Background Halo */}
    <Circle cx="100" cy="100" r="76" fill="url(#cartBgGrad)" />
    <Circle cx="100" cy="100" r="54" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

    {/* Cart Base Geometry */}
    <Path
      d="M52 70h96l-12 52a12 12 0 0 1-11.8 9.3H75.8A12 12 0 0 1 64 122L52 70z"
      fill={isDark ? '#0D172B' : '#FFFFFF'}
      stroke={isDark ? '#2563EB' : '#3B82F6'}
      strokeWidth="2.5"
    />
    <Path d="M42 54h14l6 24" stroke={isDark ? '#3B82F6' : '#2563EB'} strokeWidth="2.5" strokeLinecap="round" />

    {/* Wheels */}
    <Circle cx="76" cy="148" r="8" fill="url(#cartGold)" />
    <Circle cx="124" cy="148" r="8" fill="url(#cartGold)" />

    {/* Sparkle Floating Items */}
    <Circle cx="100" cy="85" r="4" fill="#22D3EE" opacity="0.8" />
    <Path d="M128 42l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" fill="url(#cartGold)" />
    <Path d="M60 48l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" fill="#22D3EE" opacity="0.7" />
  </Svg>
)

// 2. Empty Wishlist Illustration
export const EmptyWishlistIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
        <Stop offset="100%" stopColor="#D946EF" stopOpacity="0.1" />
      </SvgGradient>
      <SvgGradient id="heartGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F6C453" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgGradient>
    </Defs>

    <Circle cx="100" cy="100" r="76" fill="url(#heartGrad)" />
    <Circle cx="100" cy="100" r="56" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

    {/* Floating Heart */}
    <Path
      d="M100 144l-34-34c-12-12-12-32 0-44s32-12 44 0l10 10 10-10c12-12 32-12 44 0s12 32 0 44l-34 34z"
      fill={isDark ? '#0D172B' : '#FFFFFF'}
      stroke="#EF4444"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <Path
      d="M100 128l-24-24c-8-8-8-22 0-30s22-8 30 0l4 4 4-4c8-8 22-8 30 0s8 22 0 30l-24 24z"
      fill="rgba(239, 68, 68, 0.15)"
    />

    {/* Floating Stars */}
    <Path d="M148 54l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" fill="url(#heartGold)" />
    <Path d="M48 64l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" fill="#22D3EE" opacity="0.8" />
  </Svg>
)

// 3. No Orders Illustration
export const NoOrdersIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="orderGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
      </SvgGradient>
    </Defs>

    <Circle cx="100" cy="100" r="76" fill="url(#orderGrad)" />

    {/* Package Box */}
    <Rect x="54" y="74" width="92" height="72" rx="14" fill={isDark ? '#0D172B' : '#FFFFFF'} stroke="#2563EB" strokeWidth="2.5" />
    <Path d="M54 94h92" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" />
    <Path d="M100 74v72" stroke="#F6C453" strokeWidth="3" />

    {/* Box Top Flaps */}
    <Path d="M54 74l46-24 46 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />

    <Circle cx="100" cy="50" r="5" fill="#F6C453" />
  </Svg>
)

// 4. No Results / Search Illustration
export const NoResultsIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="searchGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
      </SvgGradient>
    </Defs>

    <Circle cx="100" cy="100" r="76" fill="url(#searchGrad)" />

    {/* Magnifying Glass */}
    <Circle cx="92" cy="92" r="36" fill={isDark ? '#0D172B' : '#FFFFFF'} stroke="#8B5CF6" strokeWidth="3" />
    <Path d="M118 118l32 32" stroke="#F6C453" strokeWidth="4" strokeLinecap="round" />

    <Path d="M80 84a16 16 0 0 1 20 0" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </Svg>
)

// 5. Order / Payment Success Illustration
export const SuccessIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="successGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
      </SvgGradient>
    </Defs>

    <Circle cx="100" cy="100" r="76" fill="url(#successGrad)" />
    <Circle cx="100" cy="100" r="50" fill={isDark ? '#0D172B' : '#FFFFFF'} stroke="#10B981" strokeWidth="3" />

    {/* Checkmark */}
    <Path d="M80 102l14 14 28-28" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

    {/* Celebration Sparkles */}
    <Circle cx="48" cy="60" r="4" fill="#F6C453" />
    <Circle cx="152" cy="64" r="5" fill="#22D3EE" />
    <Circle cx="156" cy="136" r="4" fill="#10B981" />
    <Circle cx="44" cy="132" r="3" fill="#8B5CF6" />
  </Svg>
)

// 6. Connection / Generic Error Illustration
export const ConnectionErrorIllustration: React.FC<IllustrationProps> = ({ size = 160, isDark = true, style }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
    <Defs>
      <SvgGradient id="errGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
      </SvgGradient>
    </Defs>

    <Circle cx="100" cy="100" r="76" fill="url(#errGrad)" />
    <Circle cx="100" cy="100" r="48" fill={isDark ? '#0D172B' : '#FFFFFF'} stroke="#EF4444" strokeWidth="3" />

    {/* Warning Sign */}
    <Path d="M100 74v34" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
    <Circle cx="100" cy="120" r="3" fill="#EF4444" />
  </Svg>
)
