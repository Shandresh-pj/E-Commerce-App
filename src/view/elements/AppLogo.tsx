import React from 'react';
import { ViewStyle } from 'react-native';
import { SvkLogo } from '../../design-system/logo/SvkLogo';
import { useTheme } from '../../hooks/useTheme';

export interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'blue' | 'yellow' | 'white' | 'dark' | 'auto';
  animated?: boolean;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'auto',
  style,
}) => {
  const { isDark } = useTheme();
  const logoMode = theme === 'dark' || (theme === 'auto' && isDark) ? 'dark' : 'light';

  return (
    <SvkLogo
      size={size}
      showTagline={showText}
      mode={logoMode}
      style={style}
    />
  );
};

export default AppLogo;
