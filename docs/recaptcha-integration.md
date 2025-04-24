# Google reCAPTCHA v3 Integration

This document outlines the integration of Google reCAPTCHA v3 into the UnderNET Cservice frontend application to enhance security during user registration.

## Overview

Google reCAPTCHA v3 is a score-based system that analyzes user behavior to determine if they are legitimate users or potentially malicious actors. Unlike previous versions, it doesn't require explicit user interaction like clicking checkboxes or solving puzzles - instead, it runs in the background and returns a score.

## Configuration

The reCAPTCHA integration can be enabled/disabled and configured via environment variables:

```
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
VITE_RECAPTCHA_ENABLED=true
```

To set these up:

1. Create a `.env` file in the project root (or add to existing one)
2. Add the above variables with your values
3. Restart the development server

## How It Works

1. When enabled, the reCAPTCHA script loads automatically when the registration page is visited
2. Upon form submission, a reCAPTCHA token is generated with the action name "register"
3. The token is sent to the backend along with the registration data
4. The backend verifies the token with Google's API using the secret key

## Implementation Details

### Files Changed/Created

- `src/config/recaptcha.ts` - Configuration for reCAPTCHA
- `src/utils/recaptcha.ts` - Utility functions for loading script and getting tokens
- `src/types/recaptcha.d.ts` - TypeScript declarations for reCAPTCHA
- `src/types/api.ts` - Updated RegisterRequest interface to include reCAPTCHA token
- `src/views/SignUpView.vue` - Added reCAPTCHA integration to the registration form
- `env.d.ts` - Updated environment variable type definitions

### Backend Requirements

The backend API needs to be updated to:

1. Accept the `recaptcha_token` field in the registration endpoint
2. Verify the token with Google's API using the secret key
3. Decide on a threshold score to accept registrations (typically 0.5 or higher)

## Testing

Since reCAPTCHA v3 is score-based and evaluates real user behavior, testing should be done in different scenarios:

1. Regular usage: Normal user registration flow
2. Rapid/automated usage: Multiple registrations in quick succession
3. Disabled state: Ensure the application works when reCAPTCHA is disabled

## Resources

- [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v3 Developer Guide](https://developers.google.com/recaptcha/docs/v3)
