import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Svg, { Rect } from 'react-native-svg';

interface DrawerMenuButtonProps {
  color?: string;
  size?: number;
  style?: object;
}

const DrawerMenuButton = ({ color = '#fff', size = 22, style }: DrawerMenuButtonProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.btn, style]}
      activeOpacity={0.7}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Open menu">
        <Rect x="3" y="6" width="18" height="2" rx="1" fill={color} />
        <Rect x="3" y="11" width="18" height="2" rx="1" fill={color} />
        <Rect x="3" y="16" width="18" height="2" rx="1" fill={color} />
      </Svg>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 8,
  },
});

export default DrawerMenuButton;
