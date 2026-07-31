import React, { createContext, useContext, useMemo, useState } from 'react'

interface EarningsState {
  amount: number
  orders: number
}

interface EarningsContextValue {
  earnings: EarningsState
  completeDelivery: (earnAmount: number) => void
}

const PartnerEarningsContext = createContext<EarningsContextValue | null>(null)

// Seeded to reflect a partner already 6 orders into their day — this lines
// up with the historical figures in partnerMockData.ts (today's total there
// is this seed plus the live demo order's earning + tip).
const INITIAL_EARNINGS: EarningsState = { amount: 540, orders: 6 }

export const PartnerEarningsProvider = ({ children }: { children: React.ReactNode }) => {
  const [earnings, setEarnings] = useState<EarningsState>(INITIAL_EARNINGS)

  const value = useMemo(
    () => ({
      earnings,
      completeDelivery: (earnAmount: number) =>
        setEarnings(prev => ({ amount: prev.amount + earnAmount, orders: prev.orders + 1 })),
    }),
    [earnings],
  )

  return (
    <PartnerEarningsContext.Provider value={value}>
      {children}
    </PartnerEarningsContext.Provider>
  )
}

export const usePartnerEarnings = () => {
  const ctx = useContext(PartnerEarningsContext)
  if (!ctx) {
    throw new Error('usePartnerEarnings must be used within PartnerEarningsProvider')
  }
  return ctx
}
