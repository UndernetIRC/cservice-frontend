import type { ChannelSettings } from '@/types/api'

/** Represents a single option for select-type fields */
export interface FieldOption {
  value: number
  label: string
}

/** Validation constraints for a setting field */
export interface FieldValidation {
  min?: number
  max?: number
  maxLength?: number
}

/** Metadata for a single channel setting field */
export interface SettingField {
  key: keyof ChannelSettings
  label: string
  type: 'boolean' | 'number' | 'string' | 'select'
  requiredLevel: 450 | 500
  validation: FieldValidation
  description: string
  options?: FieldOption[]
}

/** A logical group of related setting fields */
export interface SettingGroup {
  id: string
  label: string
  fields: SettingField[]
}

/**
 * Setting groups with field metadata, validation constraints, and required access levels.
 * Groups: General (450), Protection (500), Automation (500), Float Limit (500).
 */
export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'general',
    label: 'General',
    fields: [
      {
        key: 'description',
        label: 'Description',
        type: 'string',
        requiredLevel: 450,
        validation: { maxLength: 300 },
        description: 'Channel description displayed in channel info',
      },
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        requiredLevel: 450,
        validation: { maxLength: 128 },
        description: 'Channel website URL',
      },
      {
        key: 'keywords',
        label: 'Keywords',
        type: 'string',
        requiredLevel: 450,
        validation: { maxLength: 300 },
        description: 'Type a keyword and press Enter to add',
      },
      {
        key: 'userflags',
        label: 'User Flags',
        type: 'select',
        requiredLevel: 450,
        validation: { min: 0, max: 2 },
        description: 'Default flags applied to new users joining the channel',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Op' },
          { value: 2, label: 'Voice' },
        ],
      },
    ],
  },
  {
    id: 'protection',
    label: 'Protection',
    fields: [
      {
        key: 'noop',
        label: 'No Op',
        type: 'boolean',
        requiredLevel: 500,
        validation: {},
        description: 'Prevent all users from being opped in the channel',
      },
      {
        key: 'strictop',
        label: 'Strict Op',
        type: 'boolean',
        requiredLevel: 500,
        validation: {},
        description: 'Only authenticated users can be opped',
      },
      {
        key: 'massdeoppro',
        label: 'Mass Deop Protection',
        type: 'number',
        requiredLevel: 500,
        validation: { min: 0, max: 7 },
        description: 'Number of deops before triggering protection (0 to disable)',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    fields: [
      {
        key: 'autojoin',
        label: 'Auto Join',
        type: 'boolean',
        requiredLevel: 500,
        validation: {},
        description: 'Automatically join the channel on connect',
      },
      {
        key: 'autotopic',
        label: 'Auto Topic',
        type: 'boolean',
        requiredLevel: 500,
        validation: {},
        description: 'Automatically set the channel topic from description',
      },
    ],
  },
  {
    id: 'floatlim',
    label: 'Float Limit',
    fields: [
      {
        key: 'floatlim',
        label: 'Float Limit',
        type: 'boolean',
        requiredLevel: 500,
        validation: {},
        description: 'Enable dynamic user limit that adjusts based on channel population',
      },
      {
        key: 'floatgrace',
        label: 'Float Grace',
        type: 'number',
        requiredLevel: 500,
        validation: { min: 0, max: 19 },
        description: 'Grace period before adjusting the limit',
      },
      {
        key: 'floatmargin',
        label: 'Float Margin',
        type: 'number',
        requiredLevel: 500,
        validation: { min: 2, max: 20 },
        description: 'Margin above current users for the limit',
      },
      {
        key: 'floatmax',
        label: 'Float Max',
        type: 'number',
        requiredLevel: 500,
        validation: { min: 0, max: 65536 },
        description: 'Maximum user limit value',
      },
      {
        key: 'floatperiod',
        label: 'Float Period',
        type: 'number',
        requiredLevel: 500,
        validation: { min: 20, max: 200 },
        description: 'Seconds between limit adjustments',
      },
    ],
  },
]

/**
 * Returns setting groups filtered by access level and mode.
 * In read-only mode: all groups with all fields are returned.
 * In edit mode: only fields where accessLevel >= requiredLevel, filtering out empty groups.
 */
export function getVisibleGroups(accessLevel: number, editMode: boolean): SettingGroup[] {
  if (!editMode) {
    return SETTING_GROUPS
  }

  return SETTING_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter((field) => accessLevel >= field.requiredLevel),
  })).filter((group) => group.fields.length > 0)
}

/**
 * Validates a single field value against its constraints.
 * Returns an error string if invalid, or null if valid.
 */
export function validateField(
  key: keyof ChannelSettings,
  value: ChannelSettings[keyof ChannelSettings],
): string | null {
  const field = SETTING_GROUPS.flatMap((g) => g.fields).find((f) => f.key === key)
  if (!field) return null

  const { validation } = field

  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `Must be at least ${validation.min}`
    }
    if (validation.max !== undefined && value > validation.max) {
      return `Must be at most ${validation.max}`
    }
  }

  if (typeof value === 'string') {
    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return `Must be at most ${validation.maxLength} characters`
    }
    if (field.key === 'url' && value.length > 0) {
      try {
        const parsed = new URL(value)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return 'Must be an http or https URL'
        }
      } catch {
        return 'Must be a valid URL (e.g. https://example.com)'
      }
    }
  }

  return null
}
