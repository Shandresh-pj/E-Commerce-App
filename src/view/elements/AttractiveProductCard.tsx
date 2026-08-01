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

const PRODUCT_BG_COLORS = [
  ['#F0F7FF', '#E0EFFE'],
  ['#FFF5F5', '#FFE4E4'],
  ['#F5FFF8', '#DDF7E3'],
  ['#FFFBF0', '#FEF3C7'],
  ['#FAF5FF', '#F3E8FF'],
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
  const price = parseFloat(item.price) || 0
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  const bgColors = PRODUCT_BG_COLORS[index % PRODUCT_BG_COLORS.length]

  const initialImg = buildImageUrl(imageUri || item.image, item.name, 'product')
  const [currentImg, setCurrentImg] = useState(initialImg)

  useEffect(() => {
    setCurrentImg(buildImageUrl(imageUri || item.image, item.name, 'product'))
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
        {/* Curved Image Box with Pastel Mesh Gradient */}
        <LinearGradient
          colors={bgColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imgBox}
        >
          {/* Floating Hot Discount Pill */}
          {discount > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>🔥 {discount}% OFF</Text>
            </View>
          )}

          <Image
            source={{ uri: currentImg }}
            style={styles.productImg}
            resizeMode="contain"
            onError={() => {
              const fallback = getFallbackImage(item.name, 'product')
              if (currentImg !== fallback) {
                setCurrentImg(fallback)
              }
            }}
          />
        </LinearGradient>

        {/* Name & Unit */}
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.unitPill}>
          <Text style={styles.unitText} numberOfLines={1}>
            {item.unit || item.weight || '1 unit'}
          </Text>
        </View>

        {/* Pricing & ADD Stepper */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              ₹{price.toLocaleString('en-IN')}
            </Text>
            {mrp > price && (
              <Text style={styles.mrpText}>
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
                  colors={['#0C831F', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtnGradient}
                >
                  <Text style={hText.addBtnText}>ADD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.stepperContainer, animatedBtnStyle]}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  handlePop()
                  onDec()
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.stepSymbol}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  handlePop()
                  onInc()
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.stepSymbol}>+</Text>
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
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
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
  fallbackEmoji: {
    fontSize: 34,
    color: '#8E8E93',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141414',
    marginBottom: 4,
    minHeight: 34,
    lineHeight: 17,
  },
  unitPill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  unitText: {
    fontSize: 10.5,
    color: '#636366',
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
    color: '#141414',
  },
  mrpText: {
    fontSize: 10.5,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  addBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F6E6',
    borderRadius: 12,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stepBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0C831F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSymbol: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
    marginHorizontal: 7,
  },
})

export default AttractiveProductCard
