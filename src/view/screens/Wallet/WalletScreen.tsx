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
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';

const TRANSACTIONS = [
  {
    id: '1',
    title: 'Cashback Received',
    date: 'May 18, 2026',
    amount: '+$25.00',
    type: 'credit',
    icon: 'coins' as const,
  },
  {
    id: '2',
    title: 'Payment to Order #SVK-8823',
    date: 'May 16, 2026',
    amount: '-$99.00',
    type: 'debit',
    icon: 'bag' as const,
  },
  {
    id: '3',
    title: 'Money Added via Card',
    date: 'May 10, 2026',
    amount: '+$100.00',
    type: 'credit',
    icon: 'card' as const,
  },
];

export const WalletScreen = ({ navigation }: any) => {
  const { tokens, isDark } = useTheme();
  const [balance, setBalance] = useState(250.0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={24} color={tokens.content.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Wallet Balance Hero Card */}
        <Surface variant="glass" radius="xl" elevation="high" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>Total Balance</Text>
            <SvkIcon name="wallet" size={28} color="#FBBF24" />
          </View>
          <Text style={styles.heroBalance}>${balance.toFixed(2)}</Text>

          <View style={styles.subBalanceRow}>
            <View>
              <Text style={styles.subBalanceLabel}>Available Balance</Text>
              <Text style={styles.subBalanceValue}>$180.00</Text>
            </View>
            <View style={styles.subDivider} />
            <View>
              <Text style={styles.subBalanceLabel}>Rewards Balance</Text>
              <Text style={styles.subBalanceValue}>$70.00</Text>
            </View>
          </View>
        </Surface>

        {/* Quick Actions */}
        <Text style={[styles.sectionHeading, { color: tokens.content.primary }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {[
            { label: 'Add Money', icon: 'plus' as const, action: () => setBalance((b) => b + 50) },
            { label: 'Send Money', icon: 'arrowUpRight' as const, action: () => {} },
            { label: 'History', icon: 'clock' as const, action: () => {} },
          ].map((item, idx) => (
            <Surface
              key={idx}
              variant="card"
              radius="lg"
              bordered
              onPress={item.action}
              style={styles.actionItem}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: tokens.brand.primarySoft }]}>
                <SvkIcon name={item.icon} size={20} color={tokens.brand.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: tokens.content.primary }]}>
                {item.label}
              </Text>
            </Surface>
          ))}
        </View>

        {/* Transaction Ledger */}
        <View style={styles.ledgerHeader}>
          <Text style={[styles.sectionHeading, { color: tokens.content.primary, marginBottom: 0 }]}>
            Recent Transactions
          </Text>
          <Text style={[styles.seeAll, { color: tokens.brand.primary }]}>See All</Text>
        </View>

        {TRANSACTIONS.map((txn) => (
          <Surface key={txn.id} variant="card" radius="lg" bordered style={styles.txnCard}>
            <View style={[styles.txnIconCircle, { backgroundColor: tokens.surface.interactive }]}>
              <SvkIcon name={txn.icon} size={20} color={tokens.content.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[styles.txnTitle, { color: tokens.content.primary }]}>{txn.title}</Text>
              <Text style={[styles.txnDate, { color: tokens.content.tertiary }]}>{txn.date}</Text>
            </View>
            <Text
              style={[
                styles.txnAmount,
                { color: txn.type === 'credit' ? tokens.semantic.success : tokens.content.primary },
              ]}
            >
              {txn.amount}
            </Text>
          </Surface>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WalletScreen;

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
  heroCard: {
    padding: SPACING.xl,
    backgroundColor: '#0F172A',
    marginBottom: SPACING.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    ...TYPOGRAPHY.label,
    color: '#94A3B8',
  },
  heroBalance: {
    ...TYPOGRAPHY.metric,
    color: '#FFFFFF',
    marginVertical: SPACING.md,
  },
  subBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  subBalanceLabel: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
  },
  subBalanceValue: {
    ...TYPOGRAPHY.title,
    color: '#FFFFFF',
    marginTop: 2,
  },
  subDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.xl,
  },
  sectionHeading: {
    ...TYPOGRAPHY.headingS,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: 4,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  ledgerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  seeAll: {
    ...TYPOGRAPHY.label,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  txnIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnTitle: {
    ...TYPOGRAPHY.title,
  },
  txnDate: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  txnAmount: {
    ...TYPOGRAPHY.price,
  },
});
