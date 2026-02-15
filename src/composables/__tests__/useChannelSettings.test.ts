import { describe, it, expect } from 'vitest'
import { SETTING_GROUPS, getVisibleGroups, validateField } from '../useChannelSettings'

describe('useChannelSettings', () => {
  describe('SETTING_GROUPS', () => {
    it('should have 4 groups', () => {
      expect(SETTING_GROUPS).toHaveLength(4)
    })

    it('should have correct group ids and labels', () => {
      expect(SETTING_GROUPS[0]).toMatchObject({ id: 'general', label: 'General' })
      expect(SETTING_GROUPS[1]).toMatchObject({ id: 'protection', label: 'Protection' })
      expect(SETTING_GROUPS[2]).toMatchObject({ id: 'automation', label: 'Automation' })
      expect(SETTING_GROUPS[3]).toMatchObject({ id: 'floatlim', label: 'Float Limit' })
    })

    it('should have correct fields in General group', () => {
      const general = SETTING_GROUPS.find((g) => g.id === 'general')!
      const keys = general.fields.map((f) => f.key)
      expect(keys).toEqual(['description', 'url', 'keywords', 'userflags'])
    })

    it('should have correct fields in Protection group', () => {
      const protection = SETTING_GROUPS.find((g) => g.id === 'protection')!
      const keys = protection.fields.map((f) => f.key)
      expect(keys).toEqual(['noop', 'strictop', 'massdeoppro'])
    })

    it('should have correct fields in Automation group', () => {
      const automation = SETTING_GROUPS.find((g) => g.id === 'automation')!
      const keys = automation.fields.map((f) => f.key)
      expect(keys).toEqual(['autojoin', 'autotopic'])
    })

    it('should have correct fields in Float Limit group', () => {
      const floatlim = SETTING_GROUPS.find((g) => g.id === 'floatlim')!
      const keys = floatlim.fields.map((f) => f.key)
      expect(keys).toEqual(['floatlim', 'floatgrace', 'floatmargin', 'floatmax', 'floatperiod'])
    })

    it('should contain all 14 setting fields across all groups', () => {
      const allKeys = SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key))
      expect(allKeys).toHaveLength(14)
      expect(allKeys).toContain('autojoin')
      expect(allKeys).toContain('autotopic')
      expect(allKeys).toContain('description')
      expect(allKeys).toContain('floatgrace')
      expect(allKeys).toContain('floatlim')
      expect(allKeys).toContain('floatmargin')
      expect(allKeys).toContain('floatmax')
      expect(allKeys).toContain('floatperiod')
      expect(allKeys).toContain('keywords')
      expect(allKeys).toContain('massdeoppro')
      expect(allKeys).toContain('noop')
      expect(allKeys).toContain('strictop')
      expect(allKeys).toContain('url')
      expect(allKeys).toContain('userflags')
    })

    it('should have userflags field with select type and options', () => {
      const general = SETTING_GROUPS.find((g) => g.id === 'general')!
      const userflags = general.fields.find((f) => f.key === 'userflags')!
      expect(userflags.type).toBe('select')
      expect(userflags.options).toEqual([
        { value: 0, label: 'None' },
        { value: 1, label: 'Op' },
        { value: 2, label: 'Voice' },
      ])
    })

    it('should set General fields to requiredLevel 450', () => {
      const general = SETTING_GROUPS.find((g) => g.id === 'general')!
      for (const field of general.fields) {
        expect(field.requiredLevel).toBe(450)
      }
    })

    it('should set Protection, Automation, and Float Limit fields to requiredLevel 500', () => {
      const nonGeneral = SETTING_GROUPS.filter((g) => g.id !== 'general')
      for (const group of nonGeneral) {
        for (const field of group.fields) {
          expect(field.requiredLevel).toBe(500)
        }
      }
    })
  })

  describe('getVisibleGroups', () => {
    it('should return all groups in read-only mode regardless of access level', () => {
      const groups = getVisibleGroups(100, false)
      expect(groups).toHaveLength(4)
      expect(groups.map((g) => g.id)).toEqual(['general', 'protection', 'automation', 'floatlim'])
    })

    it('should return all groups in read-only mode even for level 0', () => {
      const groups = getVisibleGroups(0, false)
      expect(groups).toHaveLength(4)
    })

    it('should return all fields within groups in read-only mode', () => {
      const groups = getVisibleGroups(100, false)
      const allKeys = groups.flatMap((g) => g.fields.map((f) => f.key))
      expect(allKeys).toHaveLength(14)
    })

    it('should return only General group in edit mode with level 450', () => {
      const groups = getVisibleGroups(450, true)
      expect(groups).toHaveLength(1)
      const general = groups[0]!
      expect(general.id).toBe('general')
      expect(general.fields.map((f) => f.key)).toEqual([
        'description',
        'url',
        'keywords',
        'userflags',
      ])
    })

    it('should return all 4 groups in edit mode with level 500', () => {
      const groups = getVisibleGroups(500, true)
      expect(groups).toHaveLength(4)
      expect(groups.map((g) => g.id)).toEqual(['general', 'protection', 'automation', 'floatlim'])
    })

    it('should return no groups in edit mode with level 100', () => {
      const groups = getVisibleGroups(100, true)
      expect(groups).toHaveLength(0)
    })

    it('should return no groups in edit mode with level 449', () => {
      const groups = getVisibleGroups(449, true)
      expect(groups).toHaveLength(0)
    })

    it('should return all 4 groups in edit mode with level above 500', () => {
      const groups = getVisibleGroups(1000, true)
      expect(groups).toHaveLength(4)
    })
  })

  describe('validateField', () => {
    // Numeric field validation
    it('should return null for valid massdeoppro values', () => {
      expect(validateField('massdeoppro', 0)).toBeNull()
      expect(validateField('massdeoppro', 5)).toBeNull()
      expect(validateField('massdeoppro', 7)).toBeNull()
    })

    it('should return error for massdeoppro outside range 0-7', () => {
      expect(validateField('massdeoppro', -1)).toBeTruthy()
      expect(validateField('massdeoppro', 8)).toBeTruthy()
    })

    it('should return null for valid floatgrace values', () => {
      expect(validateField('floatgrace', 0)).toBeNull()
      expect(validateField('floatgrace', 19)).toBeNull()
    })

    it('should return error for floatgrace outside range 0-19', () => {
      expect(validateField('floatgrace', -1)).toBeTruthy()
      expect(validateField('floatgrace', 20)).toBeTruthy()
    })

    it('should return null for valid floatmargin values', () => {
      expect(validateField('floatmargin', 2)).toBeNull()
      expect(validateField('floatmargin', 20)).toBeNull()
    })

    it('should return error for floatmargin outside range 2-20', () => {
      expect(validateField('floatmargin', 1)).toBeTruthy()
      expect(validateField('floatmargin', 21)).toBeTruthy()
    })

    it('should return null for valid floatmax values', () => {
      expect(validateField('floatmax', 0)).toBeNull()
      expect(validateField('floatmax', 65536)).toBeNull()
    })

    it('should return error for floatmax outside range 0-65536', () => {
      expect(validateField('floatmax', -1)).toBeTruthy()
      expect(validateField('floatmax', 65537)).toBeTruthy()
    })

    it('should return null for valid floatperiod values', () => {
      expect(validateField('floatperiod', 20)).toBeNull()
      expect(validateField('floatperiod', 200)).toBeNull()
    })

    it('should return error for floatperiod outside range 20-200', () => {
      expect(validateField('floatperiod', 19)).toBeTruthy()
      expect(validateField('floatperiod', 201)).toBeTruthy()
    })

    it('should return null for valid userflags values', () => {
      expect(validateField('userflags', 0)).toBeNull()
      expect(validateField('userflags', 1)).toBeNull()
      expect(validateField('userflags', 2)).toBeNull()
    })

    it('should return error for userflags outside range 0-2', () => {
      expect(validateField('userflags', -1)).toBeTruthy()
      expect(validateField('userflags', 3)).toBeTruthy()
    })

    // String field validation
    it('should return null for description within 300 chars', () => {
      expect(validateField('description', 'A short description')).toBeNull()
      expect(validateField('description', 'a'.repeat(300))).toBeNull()
    })

    it('should return error for description exceeding 300 chars', () => {
      expect(validateField('description', 'a'.repeat(301))).toBeTruthy()
    })

    it('should return null for keywords within 300 chars', () => {
      expect(validateField('keywords', 'test,channel')).toBeNull()
      expect(validateField('keywords', 'a'.repeat(300))).toBeNull()
    })

    it('should return error for keywords exceeding 300 chars', () => {
      expect(validateField('keywords', 'a'.repeat(301))).toBeTruthy()
    })

    it('should return null for valid URLs', () => {
      expect(validateField('url', 'https://example.com')).toBeNull()
      expect(validateField('url', 'http://example.com/path?q=1')).toBeNull()
      expect(validateField('url', '')).toBeNull() // empty is allowed (optional)
    })

    it('should return error for invalid URLs', () => {
      expect(validateField('url', 'not-a-url')).toBeTruthy()
      expect(validateField('url', 'ftp://example.com')).toBeTruthy() // only http/https
    })

    it('should return error for url exceeding 128 chars', () => {
      expect(validateField('url', 'https://example.com/' + 'a'.repeat(110))).toBeTruthy()
    })

    // Boolean and no-validation fields
    it('should return null for boolean fields', () => {
      expect(validateField('autojoin', true)).toBeNull()
      expect(validateField('autojoin', false)).toBeNull()
      expect(validateField('noop', true)).toBeNull()
      expect(validateField('strictop', false)).toBeNull()
      expect(validateField('autotopic', true)).toBeNull()
      expect(validateField('floatlim', false)).toBeNull()
    })

    // Empty strings
    it('should return null for empty strings', () => {
      expect(validateField('description', '')).toBeNull()
      expect(validateField('url', '')).toBeNull()
      expect(validateField('keywords', '')).toBeNull()
    })
  })
})
