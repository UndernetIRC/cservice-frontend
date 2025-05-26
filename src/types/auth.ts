export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface LogoutRequest {
  logout_all: boolean
}

export interface AuthError {
  code: number
  message: string
}

export interface UserChannelResponse {
  access: number
  channel_id: number
  last_modified: number
  name: string
}

export interface CurrentUserResponse {
  id: number
  username: string
  email: string
  max_logins: number
  language_code: string
  language_name: string
  last_seen: number
  totp_enabled: boolean
  channels: UserChannelResponse[]
}
