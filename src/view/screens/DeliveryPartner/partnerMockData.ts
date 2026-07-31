// Historical/aggregate figures shown on the earnings, wallet, history and
// performance screens. These come from a partner-analytics API in a real
// backend; until one exists they're static mock data seeded to line up
// with the live "today" counter in PartnerEarningsContext.

export const PARTNER_PROFILE = {
  name: 'Rahul Sharma',
  partnerId: 'DH-48210',
  vehicle: '2-wheeler',
  rating: 4.8,
  tier: 'Gold Partner',
}

export const WEEKLY_EARNINGS = {
  rangeLabel: '16-22 Jun',
  total: 4820,
  vsLastWeekPct: 12,
  orders: 58,
  days: [
    { label: 'M', pct: 0.55 },
    { label: 'T', pct: 0.68 },
    { label: 'W', pct: 0.42 },
    { label: 'T', pct: 0.6 },
    { label: 'F', pct: 1, isToday: true },
    { label: 'S', pct: 0 },
    { label: 'S', pct: 0 },
  ],
  breakdown: [
    { label: 'Delivery payouts', amount: 3640 },
    { label: 'Incentives & streaks', amount: 680 },
    { label: 'Surge bonus', amount: 320 },
    { label: 'Tips', amount: 180 },
  ],
  surgeZone: {
    area: 'Indiranagar',
    bonusLabel: '+₹30/order till 2 PM',
  },
}

export const WALLET = {
  bank: { name: 'HDFC Bank', last4: '2841' },
  altBank: { name: 'ICICI Bank', last4: '1187' },
  recentPayouts: [
    { id: 'p1', label: 'To HDFC ••2841', amount: 3200, dateLabel: '21 Jun · 9:14 PM', status: 'done' as const },
    { id: 'p2', label: 'To HDFC ••2841', amount: 2940, dateLabel: '14 Jun · 8:50 PM', status: 'done' as const },
  ],
}

export interface HistoryOrder {
  id: string
  route: string
  timeLabel: string
  distanceKm: number
  etaMinutes: number
  amount: number
  status: 'Delivered' | 'Cancelled'
  reason?: string
}

export const ORDER_HISTORY_TODAY: HistoryOrder[] = [
  { id: '#DH8842', route: 'HSR → Sarjapur', timeLabel: '2:40 PM', distanceKm: 3.2, etaMinutes: 12, amount: 72, status: 'Delivered' },
  { id: '#DH8835', route: 'HSR → Bellandur', timeLabel: '1:55 PM', distanceKm: 4.1, etaMinutes: 16, amount: 88, status: 'Delivered' },
  { id: '#DH8829', route: 'HSR → Koramangala', timeLabel: '1:12 PM', distanceKm: 0, etaMinutes: 0, amount: 0, status: 'Cancelled', reason: 'customer unavailable' },
]

export const ORDER_HISTORY_YESTERDAY = {
  totalLabel: '₹740 · 9 orders',
  orders: [
    { id: '#DH8810', route: 'HSR → HSR Sec 7', timeLabel: '9:20 PM', distanceKm: 1.8, etaMinutes: 8, amount: 54, status: 'Delivered' as const },
  ],
}

export interface PartnerNotification {
  id: string
  emoji: string
  iconBg: string
  title: string
  body: string
  timeLabel: string
  unread: boolean
}

export const INITIAL_NOTIFICATIONS: PartnerNotification[] = [
  {
    id: 'n1',
    emoji: '⭐',
    iconBg: '#E4F6E6',
    title: 'Incentive unlocked',
    body: 'You hit 8 orders — ₹120 bonus added to today’s earnings.',
    timeLabel: '2 min ago',
    unread: true,
  },
  {
    id: 'n2',
    emoji: '💰',
    iconBg: '#EBE4FF',
    title: 'Payout sent',
    body: '₹3,200 transferred to HDFC ••2841',
    timeLabel: 'Yesterday · 9:14 PM',
    unread: true,
  },
  {
    id: 'n3',
    emoji: '💳',
    iconBg: '#FFF0D6',
    title: 'Licence expiring soon',
    body: 'Re-upload your driving licence before 31 Jul to stay active.',
    timeLabel: '2 days ago',
    unread: false,
  },
  {
    id: 'n4',
    emoji: '⭐',
    iconBg: '#E4F6E6',
    title: 'New 5★ rating',
    body: '"Super fast and polite." Your rating is now 4.8.',
    timeLabel: '3 days ago',
    unread: false,
  },
]

export interface KycDocument {
  id: string
  emoji: string
  name: string
  detail: string
  status: 'Verified' | 'Renew'
  action: 'licence' | 'vehicle' | 'view'
}

export const DOCUMENTS_KYC: KycDocument[] = [
  { id: 'dl', emoji: '💳', name: 'Driving licence', detail: '•••12345 · exp 12/2031', status: 'Verified', action: 'licence' },
  { id: 'rc', emoji: '💳', name: 'RC certificate', detail: 'Expires in 22 days', status: 'Renew', action: 'vehicle' },
  { id: 'ins', emoji: '🛡', name: 'Vehicle insurance', detail: 'Valid till 03/2027', status: 'Verified', action: 'vehicle' },
  { id: 'aadhaar', emoji: '🪪', name: 'Aadhaar', detail: '••••8842', status: 'Verified', action: 'view' },
  { id: 'pan', emoji: '💳', name: 'PAN card', detail: '••••210F', status: 'Verified', action: 'view' },
]

export const PERFORMANCE = {
  rating: 4.8,
  tier: 'Gold Partner',
  summary: "Top 8% in Bengaluru this week. Keep above 95% to reach Platinum.",
  acceptancePct: 94,
  onTimePct: 96,
  loginHours: '42h',
  cancellationPct: 3,
  feedback: [
    'Super fast and polite, called before arriving.',
    'Handled the cold items carefully. Thanks!',
  ],
}
