/**
 * JSK Application Configuration
 * Defines image fallback options, Blurhash presets, API timeout limits, and display settings.
 */

module.exports = {
  jsk: {
    version: '1.0.0',
    appName: 'SVK E-Commerce',
    environment: 'production',
    image: {
      enableBlurhash: true,
      defaultBlurhash: 'L6PZf_002ycP.pt7r=x]00?a_4n%',
      fallbackQuality: 'medium',
      timeoutMs: 10000,
    },
    api: {
      timeout: 15000,
      retryAttempts: 3,
      currency: '₹',
      currencyCode: 'INR',
    },
    ui: {
      animationDuration: 300,
      toastDurationMs: 2500,
      theme: 'system',
    },
  },
};
