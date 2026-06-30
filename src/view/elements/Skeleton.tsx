import React, { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { THEME } from '../assets/styles/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

// Single shimmering block driven by a looping opacity animation.
export const Skeleton = ({
  width = '100%',
  height = 14,
  radius = THEME.RADIUS.small,
  style,
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, opacity },
        styles.block,
        style,
      ]}
    />
  )
}

// Matches the ProductList card silhouette for a 2-column grid.
export const ProductCardSkeleton = ({ width }: { width: number }) => (
  <View style={[styles.card, { width }]}>
    <Skeleton height={120} radius={THEME.RADIUS.medium} />
    <Skeleton height={13} width="85%" style={styles.line} />
    <Skeleton height={13} width="55%" style={styles.line} />
    <Skeleton height={22} width={90} radius={THEME.RADIUS.pill} style={styles.line} />
    <Skeleton height={40} radius={THEME.RADIUS.medium} style={styles.btn} />
  </View>
)

// Matches a cart / wishlist list row.
export const ListRowSkeleton = () => (
  <View style={styles.row}>
    <Skeleton width={80} height={80} radius={THEME.RADIUS.medium} />
    <View style={styles.rowInfo}>
      <Skeleton height={14} width="80%" />
      <Skeleton height={13} width="40%" style={styles.line} />
      <Skeleton height={30} width={110} radius={THEME.RADIUS.pill} style={styles.line} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  block: {
    backgroundColor: THEME.COLOR.btnGrey,
  },
  card: {
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: THEME.SPACING.md,
    marginBottom: THEME.SPACING.md,
    ...THEME.SHADOW.sm,
  },
  line: {
    marginTop: THEME.SPACING.sm,
  },
  btn: {
    marginTop: THEME.SPACING.md,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: THEME.SPACING.md,
    marginBottom: THEME.SPACING.md,
    ...THEME.SHADOW.sm,
  },
  rowInfo: {
    flex: 1,
    marginLeft: THEME.SPACING.md,
    justifyContent: 'center',
  },
})
