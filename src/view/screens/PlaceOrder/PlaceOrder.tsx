import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';

const STEPS = [
  { id: 1, label: 'Address' },
  { id: 2, label: 'Delivery' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Review' },
];

export default function PlaceOrderScreen({ navigation }: any) {
  const { tokens, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState('express');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isPlacing, setIsPlacing] = useState(false);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlacing(true);
      setTimeout(() => {
        setIsPlacing(false);
        navigation.navigate('OrderTracking');
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={24} color={tokens.content.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Checkout Stepper */}
      <View style={styles.stepperContainer}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isCompleted
                        ? tokens.semantic.success
                        : isActive
                        ? tokens.brand.primary
                        : tokens.surface.interactive,
                    },
                  ]}
                >
                  {isCompleted ? (
                    <SvkIcon name="checkCircle" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.stepNumber, { color: isActive ? '#FFFFFF' : tokens.content.tertiary }]}>
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: isActive || isCompleted ? tokens.content.primary : tokens.content.tertiary },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: step.id < currentStep ? tokens.semantic.success : tokens.border.default },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Address */}
        {currentStep === 1 && (
          <View>
            <Text style={[styles.sectionHeading, { color: tokens.content.primary }]}>
              Select Delivery Address
            </Text>
            {[
              { id: 1, type: 'Home', address: '742 Evergreen Terrace, Springfield, IL, 62704', phone: '+1 555 123 4567' },
              { id: 2, type: 'Office', address: '100 Enterprise Way, Suite 400, Cupertino, CA', phone: '+1 555 987 6543' },
            ].map((item) => (
              <Surface
                key={item.id}
                variant={selectedAddress === item.id ? 'selected' : 'card'}
                radius="lg"
                bordered
                onPress={() => setSelectedAddress(item.id)}
                style={styles.optionCard}
              >
                <View style={styles.optionHeader}>
                  <Badge label={item.type} variant="discount" size="sm" />
                  <SvkIcon
                    name={selectedAddress === item.id ? 'checkCircle' : 'chevronRight'}
                    size={20}
                    color={selectedAddress === item.id ? tokens.brand.primary : tokens.content.tertiary}
                  />
                </View>
                <Text style={[styles.addressText, { color: tokens.content.primary }]}>{item.address}</Text>
                <Text style={[styles.phoneText, { color: tokens.content.secondary }]}>{item.phone}</Text>
              </Surface>
            ))}
          </View>
        )}

        {/* Step 2: Delivery Option */}
        {currentStep === 2 && (
          <View>
            <Text style={[styles.sectionHeading, { color: tokens.content.primary }]}>
              Choose Shipping Method
            </Text>
            {[
              { id: 'express', title: 'Express Delivery', eta: '2-3 Business Days', price: '$9.99' },
              { id: 'standard', title: 'Standard Delivery', eta: '5-7 Business Days', price: 'FREE' },
            ].map((item) => (
              <Surface
                key={item.id}
                variant={selectedDelivery === item.id ? 'selected' : 'card'}
                radius="lg"
                bordered
                onPress={() => setSelectedDelivery(item.id)}
                style={styles.optionCard}
              >
                <View style={styles.optionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: tokens.content.primary }]}>{item.title}</Text>
                    <Text style={[styles.optionSubtitle, { color: tokens.content.secondary }]}>{item.eta}</Text>
                  </View>
                  <Text style={[styles.optionPrice, { color: tokens.content.brand }]}>{item.price}</Text>
                </View>
              </Surface>
            ))}
          </View>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <View>
            <Text style={[styles.sectionHeading, { color: tokens.content.primary }]}>
              Select Payment Method
            </Text>
            {[
              { id: 'card', title: 'Credit / Debit Card', icon: 'card' as const },
              { id: 'upi', title: 'UPI (GPay / PhonePe)', icon: 'qrCode' as const },
              { id: 'wallet', title: 'Wallet Balance ($250.00)', icon: 'wallet' as const },
            ].map((item) => (
              <Surface
                key={item.id}
                variant={selectedPayment === item.id ? 'selected' : 'card'}
                radius="lg"
                bordered
                onPress={() => setSelectedPayment(item.id)}
                style={styles.optionCard}
              >
                <View style={styles.optionRow}>
                  <SvkIcon name={item.icon} size={24} color={tokens.brand.primary} />
                  <Text style={[styles.optionTitle, { color: tokens.content.primary, marginLeft: 12, flex: 1 }]}>
                    {item.title}
                  </Text>
                  <SvkIcon
                    name={selectedPayment === item.id ? 'checkCircle' : 'chevronRight'}
                    size={20}
                    color={selectedPayment === item.id ? tokens.brand.primary : tokens.content.tertiary}
                  />
                </View>
              </Surface>
            ))}
          </View>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <View>
            <Text style={[styles.sectionHeading, { color: tokens.content.primary }]}>
              Review Order Details
            </Text>
            <Surface variant="card" radius="lg" bordered style={styles.reviewCard}>
              <View style={styles.reviewSection}>
                <Text style={[styles.reviewLabel, { color: tokens.content.secondary }]}>Shipping Address</Text>
                <Text style={[styles.reviewValue, { color: tokens.content.primary }]}>
                  742 Evergreen Terrace, Springfield, IL
                </Text>
              </View>
              <View style={styles.reviewSection}>
                <Text style={[styles.reviewLabel, { color: tokens.content.secondary }]}>Payment Method</Text>
                <Text style={[styles.reviewValue, { color: tokens.content.primary }]}>
                  {selectedPayment.toUpperCase()} Card ending in 4242
                </Text>
              </View>
              <View style={styles.reviewSection}>
                <Text style={[styles.reviewLabel, { color: tokens.content.secondary }]}>Total Payable</Text>
                <Text style={[styles.totalPriceText, { color: tokens.content.brand }]}>
                  $1,167.99
                </Text>
              </View>
            </Surface>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.footer, { backgroundColor: tokens.surface.card, borderColor: tokens.border.default }]}>
        <Button
          title={currentStep === 4 ? (isPlacing ? 'Placing Order...' : 'Place Order') : 'Continue'}
          onPress={handleNextStep}
          loading={isPlacing}
          variant="gold"
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.headingM,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: -14,
    marginHorizontal: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  sectionHeading: {
    ...TYPOGRAPHY.headingS,
    marginBottom: SPACING.md,
  },
  optionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    ...TYPOGRAPHY.bodyM,
    marginBottom: 4,
  },
  phoneText: {
    ...TYPOGRAPHY.caption,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    ...TYPOGRAPHY.title,
  },
  optionSubtitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  optionPrice: {
    ...TYPOGRAPHY.price,
  },
  reviewCard: {
    padding: SPACING.lg,
  },
  reviewSection: {
    marginBottom: SPACING.md,
  },
  reviewLabel: {
    ...TYPOGRAPHY.caption,
    marginBottom: 2,
  },
  reviewValue: {
    ...TYPOGRAPHY.title,
  },
  totalPriceText: {
    ...TYPOGRAPHY.priceLarge,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
});
