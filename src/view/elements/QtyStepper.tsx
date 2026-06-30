import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { THEME } from '../assets/styles/theme'

type Size = 'sm' | 'md'

interface QtyStepperProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  size?: Size
  disabledDecrement?: boolean
  disabledIncrement?: boolean
}

const QtyStepper = ({
  value,
  onIncrement,
  onDecrement,
  size = 'md',
  disabledDecrement = false,
  disabledIncrement = false,
}: QtyStepperProps) => {
  const dim = size === 'sm' ? 30 : 36

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.btn,
          { width: dim, height: dim },
          disabledDecrement && styles.btnDisabled,
        ]}
        onPress={onDecrement}
        disabled={disabledDecrement}
        activeOpacity={0.8}
      >
        <Text style={styles.sign}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.value, size === 'sm' && styles.valueSm]}>{value}</Text>
      <TouchableOpacity
        style={[
          styles.btn,
          { width: dim, height: dim },
          disabledIncrement && styles.btnDisabled,
        ]}
        onPress={onIncrement}
        disabled={disabledIncrement}
        activeOpacity={0.8}
      >
        <Text style={styles.sign}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: THEME.RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    padding: 3,
  },
  btn: {
    borderRadius: THEME.RADIUS.pill,
    backgroundColor: THEME.COLOR.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: THEME.COLOR.bgGrey,
  },
  sign: {
    color: '#fff',
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    lineHeight: 22,
  },
  value: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
  },
  valueSm: {
    minWidth: 28,
    fontSize: 14,
  },
})

export default QtyStepper
