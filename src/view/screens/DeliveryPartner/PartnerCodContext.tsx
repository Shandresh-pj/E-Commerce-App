import React, { createContext, useContext, useMemo, useState } from 'react'

export const COD_DEPOSIT_LIMIT = 2500

interface CodDeposit {
  id: string
  label: string
  amount: number
  dateLabel: string
}

interface CodContextValue {
  cashInHand: number
  recentDeposits: CodDeposit[]
  addCollectedCash: (amount: number) => void
  deposit: (amount: number, method: 'UPI deposit' | 'Store deposit - HSR') => void
}

const PartnerCodContext = createContext<CodContextValue | null>(null)

// Seeded so that collecting today's demo COD order (₹248) brings cash-in-hand
// to the ₹1,860 shown on the deposit screen reference.
const INITIAL_CASH_IN_HAND = 1612
const INITIAL_DEPOSITS: CodDeposit[] = [
  { id: 'd1', label: 'UPI deposit', amount: 2100, dateLabel: 'Today · 11:02 AM' },
  { id: 'd2', label: 'Store deposit - HSR', amount: 1500, dateLabel: 'Yesterday · 9:40 PM' },
]

export const PartnerCodProvider = ({ children }: { children: React.ReactNode }) => {
  const [cashInHand, setCashInHand] = useState(INITIAL_CASH_IN_HAND)
  const [recentDeposits, setRecentDeposits] = useState<CodDeposit[]>(INITIAL_DEPOSITS)

  const value = useMemo(
    () => ({
      cashInHand,
      recentDeposits,
      addCollectedCash: (amount: number) => setCashInHand(prev => prev + amount),
      deposit: (amount: number, method: 'UPI deposit' | 'Store deposit - HSR') => {
        setCashInHand(prev => Math.max(prev - amount, 0))
        setRecentDeposits(prev => [
          { id: `d-${Date.now()}`, label: method, amount, dateLabel: 'Just now' },
          ...prev,
        ])
      },
    }),
    [cashInHand, recentDeposits],
  )

  return <PartnerCodContext.Provider value={value}>{children}</PartnerCodContext.Provider>
}

export const usePartnerCod = () => {
  const ctx = useContext(PartnerCodContext)
  if (!ctx) {
    throw new Error('usePartnerCod must be used within PartnerCodProvider')
  }
  return ctx
}
