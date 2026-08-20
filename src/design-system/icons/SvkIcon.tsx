import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export type SvkIconName =
  // Navigation
  | 'home'
  | 'categories'
  | 'wishlist'
  | 'cart'
  | 'profile'
  | 'search'
  | 'back'
  | 'close'
  | 'chevronRight'
  | 'chevronDown'
  | 'menu'
  // Commerce & Catalog
  | 'filter'
  | 'sort'
  | 'heart'
  | 'heartFilled'
  | 'star'
  | 'share'
  | 'tag'
  | 'bag'
  | 'truck'
  | 'plus'
  | 'minus'
  | 'trash'
  // Payment & Wallet
  | 'wallet'
  | 'card'
  | 'shieldCheck'
  | 'qrCode'
  | 'arrowUpRight'
  | 'arrowDownLeft'
  | 'coins'
  // Account & System
  | 'bell'
  | 'location'
  | 'globe'
  | 'lock'
  | 'user'
  | 'settings'
  | 'help'
  | 'logout'
  | 'checkCircle'
  | 'alertCircle'
  | 'infoCircle'
  | 'clock'
  | 'phone'
  | 'mapPin'
  | 'navigationRider';

export interface SvkIconProps {
  name: SvkIconName;
  size?: number;
  color?: string;
  focused?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const SvkIcon: React.FC<SvkIconProps> = ({
  name,
  size = 24,
  color = '#2563EB',
  focused = false,
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const iconColor = disabled ? '#94A3B8' : color;
  const strokeWidth = focused ? 2.5 : 2;

  const renderPath = () => {
    switch (name) {
      case 'home':
        return (
          <Path
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'categories':
        return (
          <Path
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'wishlist':
      case 'heart':
        return (
          <Path
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? iconColor : 'none'}
          />
        );
      case 'heartFilled':
        return (
          <Path
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            fill={iconColor}
          />
        );
      case 'cart':
      case 'bag':
        return (
          <Path
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'profile':
      case 'user':
        return (
          <Path
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'search':
        return (
          <Path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'back':
        return (
          <Path
            d="M15 19l-7-7 7-7"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'close':
        return (
          <Path
            d="M6 18L18 6M6 6l12 12"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'chevronRight':
        return (
          <Path
            d="M9 5l7 7-7 7"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'chevronDown':
        return (
          <Path
            d="M19 9l-7 7-7-7"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'filter':
        return (
          <Path
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'star':
        return (
          <Path
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            fill={iconColor}
          />
        );
      case 'truck':
        return (
          <Path
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2m-6 0H9m11-4V9a1 1 0 00-1-1h-3v7h4a1 1 0 001-1z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'wallet':
        return (
          <Path
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'card':
        return (
          <Path
            d="M3 10h18M7 15h2m4 0h2m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'shieldCheck':
        return (
          <Path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'bell':
        return (
          <Path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'location':
      case 'mapPin':
        return (
          <Path
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'checkCircle':
        return (
          <Path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'alertCircle':
        return (
          <Path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'navigationRider':
        return (
          <Path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? iconColor : 'none'}
          />
        );
      case 'plus':
        return (
          <Path
            d="M12 4v16m8-8H4"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'minus':
        return (
          <Path
            d="M20 12H4"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      default:
        return (
          <Path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke={iconColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
    }
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      accessibilityLabel={accessibilityLabel || name}
    >
      {renderPath()}
    </Svg>
  );
};
