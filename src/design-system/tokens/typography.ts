import { TextStyle } from 'react-native';

export const TYPOGRAPHY = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,
  headingXL: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.4,
  } as TextStyle,
  headingL: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TextStyle,
  headingM: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,
  headingS: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.1,
  } as TextStyle,
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,
  bodyL: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,
  bodyM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,
  bodyS: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TextStyle,
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  } as TextStyle,
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  } as TextStyle,
  price: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  } as TextStyle,
  priceLarge: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  } as TextStyle,
  discount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  } as TextStyle,
  metric: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;
