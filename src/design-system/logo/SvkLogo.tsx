import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface SvkLogoProps {
  variant?: 'primary' | 'symbol' | 'light' | 'dark' | 'appIcon' | 'compact';
  mode?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  style?: ViewStyle;
}

export const SvkLogo: React.FC<SvkLogoProps> = ({
  variant = 'primary',
  mode = 'auto',
  size = 'md',
  showTagline = true,
  style,
}) => {
  const dimensions = {
    sm: { symbolSize: 26, fontSize: 15, taglineSize: 8, spacing: 6, iconContainer: 40 },
    md: { symbolSize: 36, fontSize: 19, taglineSize: 9.5, spacing: 8, iconContainer: 52 },
    lg: { symbolSize: 52, fontSize: 26, taglineSize: 11, spacing: 12, iconContainer: 72 },
    xl: { symbolSize: 68, fontSize: 34, taglineSize: 13, spacing: 16, iconContainer: 96 },
    hero: { symbolSize: 92, fontSize: 44, taglineSize: 16, spacing: 20, iconContainer: 128 },
  }[size];

  // Resolve color modes
  const isDark = mode === 'dark' || (mode === 'auto' && (variant === 'light' || variant === 'primary'));
  const textColor = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : isDark ? '#FFFFFF' : '#0F172A';
  const taglineColor = variant === 'light' ? '#94A3B8' : variant === 'dark' ? '#64748B' : isDark ? '#94A3B8' : '#64748B';

  const renderSvgSymbol = (customSize?: number) => {
    const s = customSize || dimensions.symbolSize;
    return (
      <Svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="svkPrimaryBlue" x1="0" y1="0" x2="100" y2="100">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1E40AF" />
          </LinearGradient>
          <LinearGradient id="svkAccentGold" x1="0" y1="0" x2="100" y2="100">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>
        {/* Outer tech shopping bag geometry */}
        <Path
          d="M25 35 C25 22 35 15 50 15 C65 15 75 22 75 35 V42 H85 C89 42 92 45 91 49 L82 85 C81 89 77 92 73 92 H27 C23 92 19 89 18 85 L9 49 C8 45 11 42 15 42 H25 V35 Z"
          fill="url(#svkPrimaryBlue)"
        />
        {/* Bag Handle Cutout */}
        <Path
          d="M37 35 C37 27 42 24 50 24 C58 24 63 27 63 35 V42 H37 V35 Z"
          fill="#0F172A"
        />
        {/* Dynamic S-curve Orbit Chevron (Gold) */}
        <Path
          d="M30 54 L45 69 C48 72 52 72 55 69 L70 54 C74 50 80 56 75 61 L56 80 C53 83 47 83 44 80 L25 61 C20 56 26 50 30 54 Z"
          fill="url(#svkAccentGold)"
        />
        {/* Tech Sparkle Accent */}
        <Path
          d="M78 22 L80 28 L86 30 L80 32 L78 38 L76 32 L70 30 L76 28 Z"
          fill="#FBBF24"
        />
      </Svg>
    );
  };

  // App Icon variant (Rounded box container with shadow)
  if (variant === 'appIcon') {
    return (
      <View
        style={[
          styles.appIconContainer,
          {
            width: dimensions.iconContainer,
            height: dimensions.iconContainer,
            borderRadius: dimensions.iconContainer * 0.28,
          },
          style,
        ]}
      >
        {renderSvgSymbol(dimensions.iconContainer * 0.65)}
      </View>
    );
  }

  // Symbol only variant
  if (variant === 'symbol') {
    return <View style={style}>{renderSvgSymbol()}</View>;
  }

  // Full logo variants (primary, compact, light, dark)
  return (
    <View style={[styles.container, style]}>
      {renderSvgSymbol()}
      <View style={{ marginLeft: dimensions.spacing }}>
        <Text style={[styles.brandText, { fontSize: dimensions.fontSize, color: textColor }]}>
          SVK <Text style={{ color: '#FBBF24' }}>E-COM</Text>
        </Text>
        {showTagline && variant !== 'compact' && (
          <Text
            style={[
              styles.taglineText,
              { fontSize: dimensions.taglineSize, color: taglineColor },
            ]}
          >
            Shop Smart. Live Better.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taglineText: {
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: -2,
  },
  appIconContainer: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default SvkLogo;
