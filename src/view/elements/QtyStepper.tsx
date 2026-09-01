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
        activeOpacity={0.75}
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
        activeOpacity={0.75}
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
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btn: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sign: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  value: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  valueSm: {
    minWidth: 26,
    fontSize: 13.5,
  },
})

export default QtyStepper
