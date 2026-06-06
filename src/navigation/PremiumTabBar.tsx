import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeIcon from '../view/assets/images/tabbar/Home.svg';
import HomeActive from '../view/assets/images/tabbar/HomeActive.svg';
import ShopIcon from '../view/assets/images/tabbar/Shop.svg';
import ShopActive from '../view/assets/images/tabbar/ShopActive.svg';
import CartIcon from '../view/assets/images/tabbar/Cart.svg';
import CartActive from '../view/assets/images/tabbar/CartActive.svg';

// ─── Inline SVG-rendered Account Icon (person silhouette) via Path ────────────
import Svg, { Path, Circle, G } from 'react-native-svg';

const AccountIconInactive = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={7} r={4} stroke="#818181" strokeWidth={1.6} />
    <Path
      d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
      stroke="#818181"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

const AccountIconActive = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={7} r={4} stroke="#fff" strokeWidth={1.8} />
    <Path
      d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Tab config ───────────────────────────────────────────────────────────────
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    Icon: React.FC;
    ActiveIcon: React.FC;
  }
> = {
  HomeTab: {
    label: 'Home',
    Icon: HomeIcon as React.FC,
    ActiveIcon: HomeActive as React.FC,
  },
  ProductList: {
    label: 'Categories',
    Icon: ShopIcon as React.FC,
    ActiveIcon: ShopActive as React.FC,
  },
  Cart: {
    label: 'Cart',
    Icon: CartIcon as React.FC,
    ActiveIcon: CartActive as React.FC,
  },
  AccountTab: {
    label: 'Account',
    Icon: AccountIconInactive,
    ActiveIcon: AccountIconActive,
  },
};

// ─── Single animated tab item ─────────────────────────────────────────────────
interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
}) => {
  const config = TAB_CONFIG[routeName];
  if (!config) return null;

  const { label, Icon, ActiveIcon } = config;

  // Spring scale on focus
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Opacity for label fade
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0.55)).current;
  // Translate-up nudge for icon when active
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.18 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1 : 0.55,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -2 : 0,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      {/* Active background pill */}
      {isFocused && <View style={styles.activePill} />}

      <Animated.View
        style={[
          styles.iconWrapper,
          { transform: [{ scale: scaleAnim }, { translateY }] },
        ]}
      >
        {isFocused ? <ActiveIcon /> : <Icon />}
      </Animated.View>

      <Animated.Text
        style={[
          styles.label,
          isFocused ? styles.labelActive : styles.labelInactive,
          { opacity: labelOpacity },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// ─── Main PremiumTabBar ───────────────────────────────────────────────────────
const PremiumTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      {/* Top border glow */}
      <View style={styles.topGlow} />

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const BAR_BG = '#1a1b2e';
const ACCENT = '#7C6EF5'; // soft violet-purple accent
const PILL_BG = 'rgba(124, 110, 245, 0.15)';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BAR_BG,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 24,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 6,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(124,110,245,0.35)',
    borderRadius: 1,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 56,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: '15%',
    right: '15%',
    bottom: 4,
    backgroundColor: PILL_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,110,245,0.22)',
  },
  iconWrapper: {
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  labelActive: {
    color: '#fff',
  },
  labelInactive: {
    color: '#818181',
  },
});

export default PremiumTabBar;
