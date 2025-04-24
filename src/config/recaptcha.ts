// Google reCAPTCHA v3 Configuration
export const RECAPTCHA_CONFIG = {
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  enabled: import.meta.env.VITE_RECAPTCHA_ENABLED === 'true' || false,
}
