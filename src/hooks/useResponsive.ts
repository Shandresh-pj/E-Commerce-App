import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 375;
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;

  const gridColumns = isDesktop ? 5 : isTablet ? 3 : 2;

  const contentPadding = isTablet ? 24 : isSmallPhone ? 12 : 16;

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape,
    gridColumns,
    contentPadding,
  };
}
