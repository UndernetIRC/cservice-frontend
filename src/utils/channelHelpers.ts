/**
 * Channel helper utilities for formatting and displaying channel information
 */

/**
 * Get human-readable access level name
 */
export function formatAccessLevel(level: number): string {
  if (level >= 500) return 'Owner'
  if (level >= 400) return 'Manager'
  return 'User'
}

/**
 * Get access level category for filtering
 */
export function getAccessLevelCategory(level: number): 'owner' | 'manager' | 'user' {
  if (level >= 500) return 'owner'
  if (level >= 400) return 'manager'
  return 'user'
}

/**
 * Get Tailwind classes for access level badge (subtle monochrome)
 */
export function getAccessLevelBadgeClass(level: number): string {
  if (level >= 500) {
    return 'bg-gray-700 text-gray-100 border border-gray-600'
  }
  if (level >= 400) {
    return 'bg-gray-600 text-gray-200 border border-gray-500'
  }
  return 'bg-gray-500 text-gray-300 border border-gray-400'
}

/**
 * Format Unix timestamp to human-readable relative time
 */
export function formatJoinDate(timestamp: number): string {
  const now = Date.now()
  const joinDate = timestamp * 1000 // Convert Unix timestamp to milliseconds
  const diffMs = now - joinDate
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) {
    return `Joined ${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`
  }
  if (diffMonths > 0) {
    return `Joined ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
  }
  if (diffWeeks > 0) {
    return `Joined ${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
  }
  if (diffDays > 0) {
    return `Joined ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }
  if (diffHours > 0) {
    return `Joined ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffMinutes > 0) {
    return `Joined ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
  }
  return 'Joined just now'
}

/**
 * Format member count
 */
export function formatMemberCount(count: number): string {
  if (count === 1) return '1 member'
  return `${count} members`
}

/**
 * Sort channels by different criteria
 */
export type SortField = 'name' | 'members' | 'joined'
export type SortDirection = 'asc' | 'desc'

export function sortChannels<T extends { channel_name: string; member_count: number; joined_at: number }>(
  channels: T[],
  field: SortField,
  direction: SortDirection
): T[] {
  const sorted = [...channels]

  sorted.sort((a, b) => {
    let compareResult = 0

    switch (field) {
      case 'name':
        compareResult = a.channel_name.localeCompare(b.channel_name)
        break
      case 'members':
        compareResult = a.member_count - b.member_count
        break
      case 'joined':
        compareResult = a.joined_at - b.joined_at
        break
    }

    return direction === 'asc' ? compareResult : -compareResult
  })

  return sorted
}
