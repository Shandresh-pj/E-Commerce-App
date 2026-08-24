import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageProps, Animated } from 'react-native';
import { blurhashToGradientSvg } from '../../shared/utils/blurhash';

export interface BlurhashImageProps extends ImageProps {
  blurhash?: string;
  category?: string;
  containerStyle?: any;
}

export const BlurhashImage: React.FC<BlurhashImageProps> = ({
  source,
  blurhash,
  category,
  style,
  containerStyle,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fallbackUri = blurhashToGradientSvg(blurhash || category);

  const handleLoadEnd = () => {
    setLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleError = (e: any) => {
    setError(true);
    props.onError?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Soft Blurhash Placeholder */}
      {(!loaded || error) && (
        <Image
          source={{ uri: fallbackUri }}
          style={[StyleSheet.absoluteFill, style]}
          resizeMode="cover"
        />
      )}

      {/* Main Image with Smooth Fade-in */}
      {!error && (
        <Animated.Image
          source={source}
          style={[style, { opacity: fadeAnim }]}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});
