type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'BIOMETRIC_GATE'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'PRICE_VALIDATION_ERROR'
  | 'SESSION_EXPIRED';

export const SecurityLogger = {
  logEvent(event: SecurityEventType, details?: Record<string, any>): void {
    if (!__DEV__) return;
    
    // Sanitize details to ensure sensitive information (tokens, passwords, CVV) is never logged
    const sanitized = details ? { ...details } : {};
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.cvv;
    delete sanitized.cardNumber;
    delete sanitized.authorization;

    console.log(`[SVK SECURITY AUDIT] [${new Date().toISOString()}] ${event}`, sanitized);
  },
};
