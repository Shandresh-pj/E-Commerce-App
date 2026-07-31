import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

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
  const dim = size === 'sm' ? 28 : 34

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
    backgroundColor: '#0C831F',
    borderRadius: 11,
    padding: 2,
  },
  btn: {
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sign: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    lineHeight: 22,
  },
  value: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  valueSm: {
    minWidth: 26,
    fontSize: 14,
  },
})

export default QtyStepper
