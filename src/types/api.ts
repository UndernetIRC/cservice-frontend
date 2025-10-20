import type { AxiosError } from 'axios'

export interface LoginRequest {
  username: string
  password: string
}

// Represents the response containing JWT tokens
export interface JwtResponse {
  access_token: string
  refresh_token: string
}

// Represents the response when MFA is required
export interface MfaRequiredResponse {
  state_token: string
  expires_at: string // ISO 8601 timestamp
  status: 'MFA_REQUIRED'
}

// The login endpoint can return either JWT tokens or an MFA required state
export type LoginResponse = JwtResponse | MfaRequiredResponse
export type RefreshResponse = JwtResponse

export interface FactorVerifyRequest {
  state_token: string
  otp: string // The TOTP code entered by the user
}

// Successful factor verification returns JWT tokens
export type FactorVerifyResponse = JwtResponse

export interface LogoutRequest {
  logout_all?: boolean
}

export interface ChannelInfo {
  channel_id: number
  channel_name: string
  access_level: number
}

export interface CurrentUserResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string
  last_seen?: number
  admin_level?: number
  channels?: ChannelInfo[]
  scopes?: string[]
  totp_enabled?: boolean
  language_name?: string
  language_code?: string
  max_logins?: number
}

export interface Role {
  id: number
  name: string
  description?: string
}

export interface RoleListResponse {
  roles: Role[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
}

export interface UpdateRoleRequest {
  name: string
  description?: string
}

// Define a custom error type that includes the API error response
export type ApiError = AxiosError<{
  message: string
  code?: number
  details?: unknown
}>

// Added based on swagger.yaml for /register endpoint
export interface RegisterRequest {
  username: string // maxLength: 12, minLength: 2
  password: string // maxLength: 72, minLength: 10
  confirm_password: string // maxLength: 72, minLength: 10
  email: string
  aup: boolean // Acceptable Use Policy agreement
  coppa: boolean
  recaptcha_token?: string // Google reCAPTCHA v3 token
}

// Added for /activate endpoint
export interface ActivateRequest {
  token: string
  recaptcha_token?: string // Google reCAPTCHA v3 token
}

// Security/Account Management Types
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface EnrollTOTPRequest {
  current_password: string
}

export interface EnrollTOTPResponse {
  qr_code_base64: string
  secret: string
}

export interface ActivateTOTPRequest {
  otp_code: string
}

export interface DisableTOTPRequest {
  current_password: string
  otp_code: string
}
