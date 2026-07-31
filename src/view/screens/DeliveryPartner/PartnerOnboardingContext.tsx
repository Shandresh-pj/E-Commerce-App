import React, { createContext, useContext, useMemo, useState } from 'react'

export type StepStatus = 'todo' | 'review' | 'verified'

export interface OnboardingSteps {
  personalDetails: StepStatus
  drivingLicence: StepStatus
  vehicleRc: StepStatus
  bankAccount: StepStatus
}

const INITIAL_STEPS: OnboardingSteps = {
  personalDetails: 'todo',
  drivingLicence: 'todo',
  vehicleRc: 'todo',
  bankAccount: 'todo',
}

interface OnboardingContextValue {
  steps: OnboardingSteps
  setStepStatus: (step: keyof OnboardingSteps, status: StepStatus) => void
  verifiedCount: number
  totalSteps: number
  isReadyToSubmit: boolean
}

const PartnerOnboardingContext = createContext<OnboardingContextValue | null>(null)

export const PartnerOnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [steps, setSteps] = useState<OnboardingSteps>(INITIAL_STEPS)

  const setStepStatus = (step: keyof OnboardingSteps, status: StepStatus) => {
    setSteps(prev => ({ ...prev, [step]: status }))
  }

  const value = useMemo(() => {
    const values = Object.values(steps)
    return {
      steps,
      setStepStatus,
      verifiedCount: values.filter(v => v === 'verified').length,
      totalSteps: values.length,
      isReadyToSubmit: values.every(v => v !== 'todo'),
    }
  }, [steps])

  return (
    <PartnerOnboardingContext.Provider value={value}>
      {children}
    </PartnerOnboardingContext.Provider>
  )
}

export const usePartnerOnboarding = () => {
  const ctx = useContext(PartnerOnboardingContext)
  if (!ctx) {
    throw new Error('usePartnerOnboarding must be used within PartnerOnboardingProvider')
  }
  return ctx
}
