import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string
  exp: number
  iat: number
  adm?: number
  scp?: string[]
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded) return false

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp > currentTime
  } catch (error) {
    console.error('Error validating JWT token:', error)
    return false
  }
}

export function getAdminLevel(token: string): number | null {
  try {
    const decoded = decodeToken(token)
    return decoded?.adm ?? null
  } catch (error) {
    console.error('Error getting admin level from token:', error)
    return null
  }
}
