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
    script.id = 'recaptcha-script' // Add ID for easier cleanup

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
 * Hides the reCAPTCHA badge and disables reCAPTCHA functionality
 */
export function hideRecaptcha(): void {
  try {
    // Remove the show style to revert to global hide rule
    const styleElement = document.getElementById('recaptcha-show-style')
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement)
    }

    console.log('[reCAPTCHA] Hidden reCAPTCHA badge')
  } catch (error) {
    console.warn('[reCAPTCHA] Error hiding reCAPTCHA:', error)
  }
}

/**
 * Shows the reCAPTCHA badge and re-enables reCAPTCHA functionality
 */
export function showRecaptcha(): void {
  try {
    // Add a style element to override the global hide rule
    let styleElement = document.getElementById('recaptcha-show-style')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'recaptcha-show-style'
      styleElement.textContent = `
        .grecaptcha-badge {
          display: block !important;
        }
      `
      document.head.appendChild(styleElement)
    }

    console.log('[reCAPTCHA] Shown reCAPTCHA badge')
  } catch (error) {
    console.warn('[reCAPTCHA] Error showing reCAPTCHA:', error)
  }
}

/**
 * Removes the reCAPTCHA script and cleans up global state
 * @deprecated Use hideRecaptcha/showRecaptcha instead for better UX
 */
export function cleanupRecaptcha(): void {
  // For now, just hide the reCAPTCHA instead of completely removing it
  hideRecaptcha()
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
