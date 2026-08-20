import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';

const TRACKING_STAGES = [
  { stage: 'Confirmed', time: '10:15 AM', done: true },
  { stage: 'Assigned', time: '10:20 AM', done: true },
  { stage: 'Out for Delivery', time: '10:35 AM', done: true, current: true },
  { stage: 'Delivered', time: 'ETA 10:52 AM', done: false },
];

export const OrderTrackingScreen = ({ navigation, route }: any) => {
  const { tokens, isDark } = useTheme();
  const orderId = route?.params?.orderNumber || 'SVK-2024-7892';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={24} color={tokens.content.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Header Card */}
        <Surface variant="card" radius="xl" elevation="medium" style={styles.mapCard}>
          <View style={[styles.mapPlaceholder, { backgroundColor: tokens.surface.interactive }]}>
            <SvkIcon name="mapPin" size={48} color={tokens.brand.primary} />
            <Text style={[styles.mapText, { color: tokens.content.secondary }]}>
              Live Navigation Active
            </Text>
            {/* Rider Floating Pin */}
            <View style={[styles.riderPin, { backgroundColor: tokens.brand.gold }]}>
              <SvkIcon name="navigationRider" size={20} color="#0F172A" />
            </View>
          </View>
        </Surface>

        {/* ETA & Status Summary */}
        <Surface variant="card" radius="lg" bordered style={styles.etaCard}>
          <View style={styles.etaRow}>
            <View>
              <Badge label="ON THE WAY" variant="success" size="sm" />
              <Text style={[styles.etaTitle, { color: tokens.content.primary }]}>Arriving in 18 mins</Text>
              <Text style={[styles.orderIdText, { color: tokens.content.tertiary }]}>Order ID #{orderId}</Text>
            </View>
            <SvkIcon name="truck" size={36} color={tokens.brand.primary} />
          </View>
        </Surface>

        {/* Delivery Partner Details */}
        <Surface variant="card" radius="lg" bordered style={styles.partnerCard}>
          <View style={styles.partnerRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60' }}
              style={styles.partnerAvatar}
            />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[styles.partnerName, { color: tokens.content.primary }]}>Rohit Sharma</Text>
              <View style={styles.ratingRow}>
                <SvkIcon name="star" size={14} color="#F59E0B" />
                <Text style={[styles.partnerRating, { color: tokens.content.primary }]}>4.9 (520 Deliveries)</Text>
              </View>
            </View>
            <Pressable style={[styles.phoneBtn, { backgroundColor: tokens.brand.primarySoft }]}>
              <SvkIcon name="phone" size={20} color={tokens.brand.primary} />
            </Pressable>
          </View>
        </Surface>

        {/* Timeline Progression */}
        <Surface variant="card" radius="lg" bordered style={styles.timelineCard}>
          <Text style={[styles.timelineHeader, { color: tokens.content.primary }]}>Delivery Progress</Text>

          {TRACKING_STAGES.map((step, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineIconColumn}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: step.current
                        ? tokens.brand.gold
                        : step.done
                        ? tokens.semantic.success
                        : tokens.border.default,
                    },
                  ]}
                >
                  <SvkIcon
                    name={step.done ? 'checkCircle' : 'clock'}
                    size={14}
                    color={step.done || step.current ? '#FFFFFF' : tokens.content.tertiary}
                  />
                </View>
                {idx < TRACKING_STAGES.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: step.done ? tokens.semantic.success : tokens.border.default },
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineTextColumn}>
                <Text style={[styles.stageTitle, { color: tokens.content.primary }]}>{step.stage}</Text>
                <Text style={[styles.stageTime, { color: tokens.content.tertiary }]}>{step.time}</Text>
              </View>
            </View>
          ))}
        </Surface>

        <Button
          title="Back to Home"
          onPress={() => navigation.navigate('Home')}
          variant="outline"
          style={{ marginTop: SPACING.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;

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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  mapCard: {
    height: 200,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapText: {
    ...TYPOGRAPHY.title,
    marginTop: 8,
  },
  riderPin: {
    position: 'absolute',
    top: 60,
    right: 80,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  etaCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaTitle: {
    ...TYPOGRAPHY.headingL,
    marginTop: 4,
  },
  orderIdText: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  partnerCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  partnerName: {
    ...TYPOGRAPHY.title,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  partnerRating: {
    ...TYPOGRAPHY.caption,
    marginLeft: 4,
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    padding: SPACING.lg,
  },
  timelineHeader: {
    ...TYPOGRAPHY.headingS,
    marginBottom: SPACING.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineIconColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 28,
    marginVertical: 2,
  },
  timelineTextColumn: {
    flex: 1,
  },
  stageTitle: {
    ...TYPOGRAPHY.title,
  },
  stageTime: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});
