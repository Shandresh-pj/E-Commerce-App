export const MOTION = {
  instant: { duration: 100 },
  fast: { duration: 200 },
  standard: { duration: 300 },
  emphasis: { duration: 450 },
  modal: { duration: 350 },
  page: { duration: 400 },

  spring: {
    gentle: { damping: 15, stiffness: 120, mass: 1 },
    bouncy: { damping: 10, stiffness: 180, mass: 0.8 },
    stiff: { damping: 20, stiffness: 250, mass: 1.2 },
  },
} as const;

export type MotionDuration = keyof typeof MOTION;
