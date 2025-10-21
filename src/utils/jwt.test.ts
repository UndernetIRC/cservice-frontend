import { describe, it, expect, beforeEach, vi } from 'vitest'
import { decodeToken, isTokenValid, getAdminLevel } from './jwt'

// Mock the jwt-decode library
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}))

import { jwtDecode } from 'jwt-decode'
const mockJwtDecode = vi.mocked(jwtDecode)

describe('JWT Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const mockPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        adm: 800,
        scp: ['read', 'write'],
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = decodeToken('valid.jwt.token')

      expect(result).toEqual(mockPayload)
      expect(mockJwtDecode).toHaveBeenCalledWith('valid.jwt.token')
    })

    it('should return null for invalid JWT token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = decodeToken('invalid.token')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Error decoding JWT token:',
        expect.any(Error),
      )
    })

    it('should decode token without optional claims', () => {
      const mockPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        // No adm or scp
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = decodeToken('token.without.optional.claims')

      expect(result).toEqual(mockPayload)
      expect(result?.adm).toBeUndefined()
      expect(result?.scp).toBeUndefined()
    })

    it('should handle malformed JWT string', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Malformed JWT')
      })

      const result = decodeToken('not.a.jwt')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it('should handle empty string', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Empty string')
      })

      const result = decodeToken('')

      expect(result).toBeNull()
    })
  })

  describe('isTokenValid', () => {
    it('should return true for valid non-expired token', () => {
      const futureExpiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const mockPayload = {
        sub: 'user123',
        exp: futureExpiry,
        iat: Math.floor(Date.now() / 1000),
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = isTokenValid('valid.jwt.token')

      expect(result).toBe(true)
    })

    it('should return false for expired token', () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const mockPayload = {
        sub: 'user123',
        exp: pastExpiry,
        iat: Math.floor(Date.now() / 1000) - 7200,
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = isTokenValid('expired.jwt.token')

      expect(result).toBe(false)
    })

    it('should return false for token expiring right now', () => {
      const nowExpiry = Math.floor(Date.now() / 1000) // Expires right now
      const mockPayload = {
        sub: 'user123',
        exp: nowExpiry,
        iat: Math.floor(Date.now() / 1000) - 3600,
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = isTokenValid('expiring.now.token')

      expect(result).toBe(false)
    })

    it('should return true for token expiring in 1 second', () => {
      const futureExpiry = Math.floor(Date.now() / 1000) + 1
      const mockPayload = {
        sub: 'user123',
        exp: futureExpiry,
        iat: Math.floor(Date.now() / 1000),
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = isTokenValid('valid.jwt.token')

      expect(result).toBe(true)
    })

    it('should return false for invalid token format', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid format')
      })

      const result = isTokenValid('invalid.token')

      expect(result).toBe(false)
      // Error comes from decodeToken which is called internally
      expect(console.error).toHaveBeenCalledWith(
        'Error decoding JWT token:',
        expect.any(Error),
      )
    })

    it('should return false when decoded token is null', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Decode failed')
      })

      const result = isTokenValid('bad.token')

      expect(result).toBe(false)
    })

    it('should return false when token has no exp claim', () => {
      const mockPayload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        // Missing exp
      }

      mockJwtDecode.mockReturnValue(mockPayload as { sub: string; iat: number })

      const result = isTokenValid('token.without.exp')

      expect(result).toBe(false)
    })

    it('should handle far future expiry', () => {
      const farFutureExpiry = Math.floor(Date.now() / 1000) + 86400 * 365 // 1 year
      const mockPayload = {
        sub: 'user123',
        exp: farFutureExpiry,
        iat: Math.floor(Date.now() / 1000),
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = isTokenValid('long.lived.token')

      expect(result).toBe(true)
    })
  })

  describe('getAdminLevel', () => {
    it('should return admin level from token', () => {
      const mockPayload = {
        sub: 'admin123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        adm: 800,
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = getAdminLevel('admin.jwt.token')

      expect(result).toBe(800)
    })

    it('should return null when admin level is missing', () => {
      const mockPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        // No adm claim
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = getAdminLevel('user.jwt.token')

      expect(result).toBeNull()
    })

    it('should return 0 admin level', () => {
      const mockPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        adm: 0,
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = getAdminLevel('level.zero.token')

      expect(result).toBe(0)
    })

    it('should return high admin level (1000)', () => {
      const mockPayload = {
        sub: 'superadmin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        adm: 1000,
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = getAdminLevel('superadmin.token')

      expect(result).toBe(1000)
    })

    it('should return null for invalid token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = getAdminLevel('invalid.token')

      expect(result).toBeNull()
      // Error comes from decodeToken which is called internally
      expect(console.error).toHaveBeenCalledWith(
        'Error decoding JWT token:',
        expect.any(Error),
      )
    })

    it('should handle token decode returning null', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Decode failed')
      })

      const result = getAdminLevel('bad.token')

      expect(result).toBeNull()
    })

    it('should return admin level when token has both adm and scp', () => {
      const mockPayload = {
        sub: 'admin123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        adm: 850,
        scp: ['admin', 'user', 'read', 'write'],
      }

      mockJwtDecode.mockReturnValue(mockPayload)

      const result = getAdminLevel('full.admin.token')

      expect(result).toBe(850)
    })
  })
})
