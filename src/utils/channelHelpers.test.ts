import { describe, it, expect } from 'vitest'
import {
  formatAccessLevel,
  getAccessLevelCategory,
  getAccessLevelBadgeClass,
  formatJoinDate,
  formatMemberCount,
  sortChannels,
} from './channelHelpers'

describe('Channel Helpers', () => {
  describe('formatAccessLevel', () => {
    it('should return Owner for level >= 500', () => {
      expect(formatAccessLevel(500)).toBe('Owner')
      expect(formatAccessLevel(600)).toBe('Owner')
      expect(formatAccessLevel(1000)).toBe('Owner')
    })

    it('should return Manager for level 400-499', () => {
      expect(formatAccessLevel(400)).toBe('Manager')
      expect(formatAccessLevel(450)).toBe('Manager')
      expect(formatAccessLevel(499)).toBe('Manager')
    })

    it('should return User for level < 400', () => {
      expect(formatAccessLevel(0)).toBe('User')
      expect(formatAccessLevel(100)).toBe('User')
      expect(formatAccessLevel(399)).toBe('User')
    })
  })

  describe('getAccessLevelCategory', () => {
    it('should return owner for level >= 500', () => {
      expect(getAccessLevelCategory(500)).toBe('owner')
      expect(getAccessLevelCategory(1000)).toBe('owner')
    })

    it('should return manager for level 400-499', () => {
      expect(getAccessLevelCategory(400)).toBe('manager')
      expect(getAccessLevelCategory(499)).toBe('manager')
    })

    it('should return user for level < 400', () => {
      expect(getAccessLevelCategory(0)).toBe('user')
      expect(getAccessLevelCategory(399)).toBe('user')
    })
  })

  describe('getAccessLevelBadgeClass', () => {
    it('should return correct classes for Owner', () => {
      const classes = getAccessLevelBadgeClass(500)
      expect(classes).toContain('bg-gray-700')
      expect(classes).toContain('text-gray-100')
    })

    it('should return correct classes for Manager', () => {
      const classes = getAccessLevelBadgeClass(450)
      expect(classes).toContain('bg-gray-600')
      expect(classes).toContain('text-gray-200')
    })

    it('should return correct classes for User', () => {
      const classes = getAccessLevelBadgeClass(100)
      expect(classes).toContain('bg-gray-500')
      expect(classes).toContain('text-gray-300')
    })
  })

  describe('formatJoinDate', () => {
    it('should format years correctly', () => {
      const twoYearsAgo = Math.floor((Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(twoYearsAgo)).toBe('2 years ago')
    })

    it('should format year correctly (singular)', () => {
      const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(oneYearAgo)).toBe('1 year ago')
    })

    it('should format months correctly', () => {
      const threeMonthsAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(threeMonthsAgo)).toBe('3 months ago')
    })

    it('should format month correctly (singular)', () => {
      const oneMonthAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(oneMonthAgo)).toBe('1 month ago')
    })

    it('should format weeks correctly', () => {
      const twoWeeksAgo = Math.floor((Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(twoWeeksAgo)).toBe('2 weeks ago')
    })

    it('should format days correctly', () => {
      const threeDaysAgo = Math.floor((Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('should format hours correctly', () => {
      const fiveHoursAgo = Math.floor((Date.now() - 5 * 60 * 60 * 1000) / 1000)
      expect(formatJoinDate(fiveHoursAgo)).toBe('5 hours ago')
    })

    it('should format minutes correctly', () => {
      const tenMinutesAgo = Math.floor((Date.now() - 10 * 60 * 1000) / 1000)
      expect(formatJoinDate(tenMinutesAgo)).toBe('10 minutes ago')
    })

    it('should handle just now', () => {
      const nowTimestamp = Math.floor(Date.now() / 1000)
      expect(formatJoinDate(nowTimestamp)).toBe('Just now')
    })
  })

  describe('formatMemberCount', () => {
    it('should format singular member', () => {
      expect(formatMemberCount(1)).toBe('1 member')
    })

    it('should format plural members', () => {
      expect(formatMemberCount(0)).toBe('0 members')
      expect(formatMemberCount(5)).toBe('5 members')
      expect(formatMemberCount(100)).toBe('100 members')
    })
  })

  describe('sortChannels', () => {
    const channels = [
      { channel_name: '#charlie', member_count: 20, joined_at: 3000 },
      { channel_name: '#alpha', member_count: 10, joined_at: 1000 },
      { channel_name: '#bravo', member_count: 30, joined_at: 2000 },
    ]

    describe('sort by name', () => {
      it('should sort by name ascending', () => {
        const sorted = sortChannels(channels, 'name', 'asc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.channel_name).toBe('#alpha')
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.channel_name).toBe('#bravo')
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.channel_name).toBe('#charlie')
      })

      it('should sort by name descending', () => {
        const sorted = sortChannels(channels, 'name', 'desc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.channel_name).toBe('#charlie')
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.channel_name).toBe('#bravo')
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.channel_name).toBe('#alpha')
      })
    })

    describe('sort by members', () => {
      it('should sort by member count ascending', () => {
        const sorted = sortChannels(channels, 'members', 'asc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.member_count).toBe(10)
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.member_count).toBe(20)
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.member_count).toBe(30)
      })

      it('should sort by member count descending', () => {
        const sorted = sortChannels(channels, 'members', 'desc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.member_count).toBe(30)
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.member_count).toBe(20)
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.member_count).toBe(10)
      })
    })

    describe('sort by joined date', () => {
      it('should sort by join date ascending', () => {
        const sorted = sortChannels(channels, 'joined', 'asc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.joined_at).toBe(1000)
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.joined_at).toBe(2000)
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.joined_at).toBe(3000)
      })

      it('should sort by join date descending', () => {
        const sorted = sortChannels(channels, 'joined', 'desc')
        expect(sorted[0]).toBeDefined()
        expect(sorted[0]!.joined_at).toBe(3000)
        expect(sorted[1]).toBeDefined()
        expect(sorted[1]!.joined_at).toBe(2000)
        expect(sorted[2]).toBeDefined()
        expect(sorted[2]!.joined_at).toBe(1000)
      })
    })

    it('should not mutate original array', () => {
      const original = [...channels]
      sortChannels(channels, 'name', 'asc')
      expect(channels).toEqual(original)
    })
  })
})
