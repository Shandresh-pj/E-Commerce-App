export interface OrderItem {
  name: string
  qty: number
}

export interface DropStop {
  addressLine: string
  subAddressLine: string
  aptLabel: string
  distanceKm: number
  etaMinutes: number
  customerPhone: string
  itemsLabel: string
}

export interface PartnerOrder {
  id: string
  earn: number
  batchBonus?: number
  tip: number
  itemCount: number
  distanceKm: number
  etaMinutes: number
  paymentType: 'Prepaid' | 'COD'
  codAmount: number
  autoRejectSeconds: number
  acceptedAt?: number
  pickup: {
    name: string
    addressLine: string
    distanceKm: number
    bay: string
    counter: string
    phone: string
  }
  drops: DropStop[]
  verifyItems: OrderItem[]
}

const PICKUP = {
  name: 'DASH Store — HSR Layout',
  addressLine: '27th Main, Sector 2',
  distanceKm: 0.8,
  bay: 'B-12',
  counter: 'Counter 3',
  phone: '+919876500001',
}

// Order dispatch is mocked locally until a real partner-orders API exists.
export const getMockOrder = (): PartnerOrder => ({
  id: 'DH8842',
  earn: 52,
  tip: 20,
  itemCount: 8,
  distanceKm: 3.2,
  etaMinutes: 14,
  paymentType: 'COD',
  codAmount: 248,
  autoRejectSeconds: 18,
  pickup: PICKUP,
  drops: [
    {
      addressLine: 'Sarjapur Road',
      subAddressLine: 'Near Wipro Gate · Apt 1204',
      aptLabel: 'Apt 1204',
      distanceKm: 2.4,
      etaMinutes: 9,
      customerPhone: '+919876500002',
      itemsLabel: '8 items',
    },
  ],
  verifyItems: [
    { name: 'Amul Milk 500ml', qty: 2 },
    { name: 'Brown Bread', qty: 1 },
    { name: 'Tomatoes 1kg', qty: 1 },
  ],
})

export const getMockBatchOrder = (): PartnerOrder => ({
  id: 'DH8851',
  earn: 104,
  batchBonus: 18,
  tip: 0,
  itemCount: 13,
  distanceKm: 8.1,
  etaMinutes: 24,
  paymentType: 'Prepaid',
  codAmount: 0,
  autoRejectSeconds: 18,
  pickup: PICKUP,
  drops: [
    {
      addressLine: 'Sarjapur Road',
      subAddressLine: '8 items',
      aptLabel: 'Apt 1204',
      distanceKm: 2.4,
      etaMinutes: 9,
      customerPhone: '+919876500003',
      itemsLabel: '8 items',
    },
    {
      addressLine: 'Bellandur',
      subAddressLine: '5 items',
      aptLabel: 'Gate 2',
      distanceKm: 2.7,
      etaMinutes: 12,
      customerPhone: '+919876500004',
      itemsLabel: '5 items',
    },
  ],
  verifyItems: [
    { name: 'Amul Milk 500ml', qty: 2 },
    { name: 'Brown Bread', qty: 1 },
    { name: 'Tomatoes 1kg', qty: 1 },
    { name: 'Basmati Rice 1kg', qty: 1 },
    { name: 'Toor Dal 500g', qty: 2 },
  ],
})
