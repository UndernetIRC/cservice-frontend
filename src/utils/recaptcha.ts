import { RECAPTCHA_CONFIG } from '@/config/recaptcha'

let recaptchaScriptLoaded = false
let recaptchaPromise: Promise<void> | null = null

/**
 * Loads the Google reCAPTCHA v3 script if not already loaded
 */
export function loadRecaptchaScript(): Promise<void> {
  if (recaptchaPromise) {
    return recaptchaPromise
  }

  if (!RECAPTCHA_CONFIG.enabled || !RECAPTCHA_CONFIG.siteKey) {
    return Promise.resolve()
  }

  recaptchaPromise = new Promise((resolve, reject) => {
    if (recaptchaScriptLoaded || window.grecaptcha) {
      resolve()
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      recaptchaScriptLoaded = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'))
    }

    document.head.appendChild(script)
  })

  return recaptchaPromise
}

/**
 * Gets a reCAPTCHA token for the specified action
 * @param action The action name to associate with this request
 * @returns The reCAPTCHA token or null if disabled/error
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!RECAPTCHA_CONFIG.enabled || !RECAPTCHA_CONFIG.siteKey) {
    return null
  }

  try {
    await loadRecaptchaScript()

    // Wait for grecaptcha to be ready
    await new Promise<void>((resolve) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(resolve)
      } else {
        resolve()
      }
    })

    if (!window.grecaptcha || !window.grecaptcha.execute) {
      console.error('reCAPTCHA not initialized properly')
      return null
    }

    const token = await window.grecaptcha.execute(RECAPTCHA_CONFIG.siteKey, { action })
    return token
  } catch (error) {
    console.error('Error getting reCAPTCHA token:', error)
    return null
  }
}
