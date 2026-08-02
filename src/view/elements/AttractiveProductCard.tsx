import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import UniqueGlassCard from './UniqueGlassCard'
import { buildImageUrl, getFallbackImage } from '../../shared/utils/imageHelper'
import { useTheme } from '../../shared/context/ThemeContext'
import Svg, { Path, Rect } from 'react-native-svg'

const BoxProductSvgIcon = ({ color = '#0066CC', size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M3 10H21" stroke={color} strokeWidth="1.8" />
    <Path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke={color} strokeWidth="1.8" />
  </Svg>
)

const PRODUCT_BG_COLORS_LIGHT = [
  ['#F0F7FF', '#E0EFFE'],
  ['#FFF5F5', '#FFE4E4'],
  ['#F5FFF8', '#DDF7E3'],
  ['#FFFBF0', '#FEF3C7'],
  ['#FAF5FF', '#F3E8FF'],
]

const PRODUCT_BG_COLORS_DARK = [
  ['rgba(30, 58, 100, 0.6)', 'rgba(15, 35, 70, 0.8)'],
  ['rgba(40, 20, 50, 0.6)', 'rgba(25, 10, 35, 0.8)'],
  ['rgba(20, 50, 40, 0.6)', 'rgba(10, 30, 25, 0.8)'],
  ['rgba(50, 45, 20, 0.6)', 'rgba(30, 25, 10, 0.8)'],
  ['rgba(35, 25, 60, 0.6)', 'rgba(20, 15, 40, 0.8)'],
]

interface ProductCardProps {
  item: any
  index: number
  cardWidth: number
  qty: number
  imageUri?: string
  discount: number
  onPress: () => void
  onAdd: () => void
  onInc: () => void
  onDec: () => void
}

export const AttractiveProductCard: React.FC<ProductCardProps> = ({
  item,
  index,
  cardWidth,
  qty,
  imageUri,
  discount,
  onPress,
  onAdd,
  onInc,
  onDec,
}) => {
  const { isDark, colors } = useTheme()
  const price = parseFloat(item.price) || 0
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  const bgPalette = isDark ? PRODUCT_BG_COLORS_DARK : PRODUCT_BG_COLORS_LIGHT
  const bgColors = bgPalette[index % bgPalette.length]

  const initialImg = buildImageUrl(imageUri || item.image, item.name, 'product')
  const [currentImg, setCurrentImg] = useState(initialImg)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setCurrentImg(buildImageUrl(imageUri || item.image, item.name, 'product'))
    setImgFailed(false)
  }, [imageUri, item.image, item.name])

  const btnScale = useSharedValue(1)

  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }))

  const handlePop = () => {
    btnScale.value = withSpring(0.85, { damping: 12, stiffness: 280 }, () => {
      btnScale.value = withSpring(1, { damping: 12, stiffness: 200 })
    })
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).springify()}
      style={{ width: cardWidth, marginBottom: 14 }}
    >
      <UniqueGlassCard onPress={onPress}>
        {/* Image Box */}
        <LinearGradient
          colors={bgColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imgBox}
        >
          {/* Floating Discount Pill */}
          {discount > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>🔥 {discount}% OFF</Text>
            </View>
          )}

          {!imgFailed ? (
            <Image
              source={{ uri: currentImg }}
              style={styles.productImg}
              resizeMode="contain"
              onError={() => {
                const fallback = getFallbackImage(item.name, 'product')
                if (currentImg !== fallback && fallback) {
                  setCurrentImg(fallback)
                } else {
                  setImgFailed(true)
                }
              }}
            />
          ) : (
            <View style={styles.svgFallbackWrap}>
              <BoxProductSvgIcon color={isDark ? '#FBBF24' : '#0B1B36'} size={36} />
            </View>
          )}
        </LinearGradient>

        {/* Name & Unit */}
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.unit || item.weight || '1 unit'}
          </Text>
        </View>

        {/* Pricing & ADD Stepper */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: isDark ? '#FBBF24' : colors.textPrimary }]}>
              ₹{price.toLocaleString('en-IN')}
            </Text>
            {mrp > price && (
              <Text style={[styles.mrpText, { color: colors.textMuted }]}>
                ₹{mrp.toLocaleString('en-IN')}
              </Text>
            )}
          </View>

          {/* Animated ADD / Stepper */}
          {qty === 0 ? (
            <Animated.View style={animatedBtnStyle}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => {
                  handlePop()
                  onAdd()
                }}
              >
                <LinearGradient
                  colors={isDark ? ['#FBBF24', '#F59E0B'] : ['#0B1B36', '#1E3A8A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtnGradient}
                >
                  <Text style={[hText.addBtnText, { color: isDark ? '#0B1B36' : '#FBBF24' }]}>ADD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.stepperContainer, animatedBtnStyle, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FFFBEB', borderColor: colors.accent }]}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  handlePop()
                  onDec()
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepSymbol, { color: colors.accentText }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: isDark ? '#FBBF24' : '#0B1B36' }]}>{qty}</Text>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  handlePop()
                  onInc()
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepSymbol, { color: colors.accentText }]}>+</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </UniqueGlassCard>
    </Animated.View>
  )
}

const hText = StyleSheet.create({
  addBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
})

const styles = StyleSheet.create({
  imgBox: {
    width: '100%',
    height: 108,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  svgFallbackWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  discountTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  productImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    minHeight: 34,
    lineHeight: 17,
  },
  unitPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  unitText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  mrpText: {
    fontSize: 10.5,
    textDecorationLine: 'line-through',
  },
  addBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderWidth: 1,
  },
  stepBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSymbol: {
    fontSize: 12,
    fontWeight: '900',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '900',
    marginHorizontal: 7,
  },
})

export default AttractiveProductCard
