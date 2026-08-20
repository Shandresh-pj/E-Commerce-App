import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { SvkLogo } from '../../../design-system/logo/SvkLogo';
import { Surface } from '../../../design-system/surfaces/Surface';

const { width: W } = Dimensions.get('window');

type PolicyDoc = 'privacy' | 'terms' | 'refund' | 'shipping' | 'about';

export const LegalScreen = ({ navigation, route }: any) => {
  const { tokens, isDark } = useTheme();
  const initialDoc: PolicyDoc = route?.params?.doc || 'privacy';
  const [activeDoc, setActiveDoc] = useState<PolicyDoc>(initialDoc);

  const docs = [
    { id: 'privacy' as PolicyDoc, title: 'Privacy Policy', icon: 'lock' },
    { id: 'terms' as PolicyDoc, title: 'Terms & Conditions', icon: 'fileText' },
    { id: 'refund' as PolicyDoc, title: 'Refund Policy', icon: 'refreshCw' },
    { id: 'shipping' as PolicyDoc, title: 'Shipping Policy', icon: 'truck' },
    { id: 'about' as PolicyDoc, title: 'About SVK E-COM', icon: 'info' },
  ];

  const renderContent = () => {
    switch (activeDoc) {
      case 'privacy':
        return (
          <View style={styles.docWrapper}>
            <Text style={[styles.docHeading, { color: tokens.content.primary }]}>
              Privacy & Data Protection Policy
            </Text>
            <Text style={[styles.effectiveDate, { color: tokens.content.tertiary }]}>
              Last updated: August 20, 2026
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              At <Text style={styles.boldText}>SVK E-COM</Text>, safeguarding your privacy and personal data is our absolute commitment. We employ bank-grade encryption protocols and tokenized security architectures across all communications.
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              1. Information We Collect
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              We only collect data necessary to fulfill your orders, provide real-time order tracking, and personalize your shopping experience. This includes account details, delivery address, and encrypted session logs.
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              2. Zero Storage of Raw Financial Credentials
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              We never store your credit card numbers, CVV, or UPI PINs on our servers. All financial transactions are tokenized and processed through PCI-DSS Level 1 compliant gateway partners.
            </Text>
          </View>
        );

      case 'terms':
        return (
          <View style={styles.docWrapper}>
            <Text style={[styles.docHeading, { color: tokens.content.primary }]}>
              Terms & Conditions of Service
            </Text>
            <Text style={[styles.effectiveDate, { color: tokens.content.tertiary }]}>
              Last updated: August 20, 2026
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              Welcome to SVK E-COM. By accessing or purchasing through our mobile application, you agree to be bound by these unified Terms and Conditions.
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              1. Customer Obligations
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              Users must provide accurate delivery information and maintain account confidentiality. Misuse, fraud, or reverse engineering of the SVK platform is strictly prohibited.
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              2. Order Authorization & Pricing Authority
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              SVK E-COM reserves the right to verify order details prior to dispatch. Prices and promotions are server-authoritative and subject to availability.
            </Text>
          </View>
        );

      case 'refund':
        return (
          <View style={styles.docWrapper}>
            <Text style={[styles.docHeading, { color: tokens.content.primary }]}>
              Refund & Cancellation Policy
            </Text>
            <Text style={[styles.effectiveDate, { color: tokens.content.tertiary }]}>
              Last updated: August 20, 2026
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              We want you to be 100% satisfied with your purchases on SVK E-COM. We offer a hassle-free 7-day return policy for eligible products.
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              1. Instant SVK Wallet Refund
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              Approved refunds returned to your SVK Wallet are credited instantly upon pickup verification. Bank account refunds take 2-5 business days.
            </Text>
          </View>
        );

      case 'shipping':
        return (
          <View style={styles.docWrapper}>
            <Text style={[styles.docHeading, { color: tokens.content.primary }]}>
              Shipping & Delivery Guidelines
            </Text>
            <Text style={[styles.effectiveDate, { color: tokens.content.tertiary }]}>
              Last updated: August 20, 2026
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              SVK E-COM offers two shipping tiers: Express Delivery (2-3 business days) and Standard Shipping (5-7 business days).
            </Text>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
              1. Real-Time Customer Order Tracking
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary }]}>
              Every order includes interactive GPS map tracking and real-time milestone progress updates directly in your account.
            </Text>
          </View>
        );

      case 'about':
        return (
          <View style={styles.docWrapper}>
            <View style={styles.aboutLogoBox}>
              <SvkLogo variant="primary" size="lg" mode={isDark ? 'dark' : 'light'} />
            </View>
            <Text style={[styles.docHeading, { color: tokens.content.primary, textAlign: 'center' }]}>
              Shop Smart. Live Better.
            </Text>
            <Text style={[styles.paragraph, { color: tokens.content.secondary, textAlign: 'center' }]}>
              SVK E-COM is an enterprise-grade customer e-commerce platform built on state-of-the-art technology, precision UX design, and secure cloud architecture.
            </Text>
            <Surface variant="glass" radius="lg" style={styles.statBox}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={[styles.statLabel, { color: tokens.content.tertiary }]}>Authentic</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={[styles.statLabel, { color: tokens.content.tertiary }]}>Support</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>Instant</Text>
                <Text style={[styles.statLabel, { color: tokens.content.tertiary }]}>Refunds</Text>
              </View>
            </Surface>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={24} color={tokens.content.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>Legal & Policy Center</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Horizontal Tab Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRail}>
        {docs.map((doc) => {
          const isActive = doc.id === activeDoc;
          return (
            <TouchableOpacity
              key={doc.id}
              onPress={() => setActiveDoc(doc.id)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isActive ? tokens.brand.primary : tokens.surface.secondary,
                  borderColor: isActive ? tokens.brand.primary : tokens.border.default,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: isActive ? '#FFFFFF' : tokens.content.primary },
                ]}
              >
                {doc.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Document Content Scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface variant="card" radius="xl" elevation="low" bordered style={styles.card}>
          {renderContent()}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabRail: {
    paddingHorizontal: 16,
    maxHeight: 52,
    marginBottom: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
  },
  docWrapper: {
    width: '100%',
  },
  docHeading: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  effectiveDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: '#FBBF24',
  },
  aboutLogoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  statBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 20,
    backgroundColor: '#0F172A',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FBBF24',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
