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
  name: string
  access: number
}

export interface MeResponse {
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
  admin_level?: number
  channels?: ChannelInfo[]
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
