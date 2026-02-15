import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChannelDetailDrawer from '../ChannelDetailDrawer.vue'
import type { ChannelDetailResponse } from '@/types/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getChannelSettings: vi.fn(),
  },
}))

import apiService from '@/services/api'

const mockChannelData: ChannelDetailResponse = {
  id: 42,
  name: '#test-channel',
  created_at: 1700000000,
  updated_at: 1700086400,
  member_count: 128,
  settings: {
    autojoin: true,
    autotopic: false,
    description: 'Test channel description',
    url: 'https://example.com',
    keywords: 'test,channel',
    userflags: 1,
    noop: false,
    strictop: true,
    massdeoppro: 3,
    floatlim: true,
    floatgrace: 5,
    floatmargin: 10,
    floatmax: 500,
    floatperiod: 60,
  },
}

// Stub Element Plus drawer as a simple div to avoid rendering issues in jsdom
const ElDrawerStub = {
  name: 'ElDrawer',
  template: `<div class="el-drawer" v-if="modelValue"><slot /><slot name="header" /></div>`,
  props: ['modelValue', 'size', 'direction', 'beforeClose', 'destroyOnClose'],
  emits: ['update:modelValue', 'close', 'opened'],
}

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(ChannelDetailDrawer, {
    props: {
      modelValue: true,
      channelId: 42,
      accessLevel: 500,
      ...props,
    },
    global: {
      stubs: {
        ElDrawer: ElDrawerStub,
        ElButton: {
          template: '<button :class="$attrs.class" :disabled="$attrs.disabled"><slot /></button>',
        },
        ChannelSettingsForm: {
          template: '<div class="channel-settings-form-stub">Form Stub</div>',
        },
      },
    },
  })
}

describe('ChannelDetailDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Fetching and rendering', () => {
    it('should fetch channel settings when opened with a channelId', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      createWrapper()
      await flushPromises()

      expect(apiService.getChannelSettings).toHaveBeenCalledWith(42)
    })

    it('should display channel name after fetching', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      const text = wrapper.text()
      expect(text).toContain('test-channel')
    })

    it('should display member count', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('128 members')
    })
  })

  describe('Loading state', () => {
    it('should show loading state while fetching', async () => {
      // Never-resolving promise to keep loading state
      vi.mocked(apiService.getChannelSettings).mockReturnValue(new Promise(() => {}))

      const wrapper = createWrapper()
      await nextTick()

      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
    })

    it('should hide loading state after fetch completes', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false)
    })
  })

  describe('Setting groups', () => {
    it('should render all 4 setting group sections', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      const sections = wrapper.findAll('[data-testid="setting-group"]')
      expect(sections).toHaveLength(4)
    })

    it('should render section headings for all groups', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      const text = wrapper.text()
      expect(text).toContain('General')
      expect(text).toContain('Protection')
      expect(text).toContain('Automation')
      expect(text).toContain('Float Limit')
    })
  })

  describe('Edit button visibility', () => {
    it('should show Edit Settings button when accessLevel >= 450', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 450 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)
    })

    it('should show Edit Settings button when accessLevel is 500', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)
    })

    it('should hide Edit Settings button when accessLevel < 450', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 449 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(false)
    })

    it('should hide Edit Settings button when accessLevel is 100', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 100 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(false)
    })
  })

  describe('Error state', () => {
    it('should show error state when API call fails', async () => {
      vi.mocked(apiService.getChannelSettings).mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Failed to load channel settings')
    })

    it('should show retry button on error', async () => {
      vi.mocked(apiService.getChannelSettings).mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[data-testid="retry-btn"]').exists()).toBe(true)
    })

    it('should retry fetching when retry button is clicked', async () => {
      vi.mocked(apiService.getChannelSettings).mockRejectedValueOnce(new Error('Network error'))
      vi.mocked(apiService.getChannelSettings).mockResolvedValueOnce(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(apiService.getChannelSettings).toHaveBeenCalledTimes(1)

      await wrapper.find('[data-testid="retry-btn"]').trigger('click')
      await flushPromises()

      expect(apiService.getChannelSettings).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(false)
    })
  })

  describe('Emits', () => {
    it('should not fetch when modelValue is false', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      createWrapper({ modelValue: false })
      await flushPromises()

      expect(apiService.getChannelSettings).not.toHaveBeenCalled()
    })
  })

  describe('Boolean settings display', () => {
    it('should display ON badge for true boolean settings', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      // autojoin is true, strictop is true
      const onBadges = wrapper.findAll('[data-testid="badge-on"]')
      expect(onBadges.length).toBeGreaterThanOrEqual(1)
    })

    it('should display OFF badge for false boolean settings', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      // autotopic is false, noop is false
      const offBadges = wrapper.findAll('[data-testid="badge-off"]')
      expect(offBadges.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Members placeholder', () => {
    it('should show members placeholder section', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[data-testid="members-placeholder"]').exists()).toBe(true)
    })

    it('should show member count in placeholder', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      const placeholder = wrapper.find('[data-testid="members-placeholder"]')
      expect(placeholder.text()).toContain('128')
    })

    it('should show coming soon message', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      const placeholder = wrapper.find('[data-testid="members-placeholder"]')
      expect(placeholder.text()).toContain('Member list coming soon')
    })
  })

  describe('Field display formatting', () => {
    it('should display userflags as Op when value is 1', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Op')
    })

    it('should display string fields with their values', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Test channel description')
      expect(wrapper.text()).toContain('https://example.com')
    })

    it('should display "Not set" for empty string fields', async () => {
      const dataWithEmptyStrings = {
        ...mockChannelData,
        settings: {
          ...mockChannelData.settings,
          description: '',
          url: '',
          keywords: '',
        },
      }
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(dataWithEmptyStrings)

      const wrapper = createWrapper()
      await flushPromises()

      const notSetElements = wrapper.findAll('[data-testid="not-set"]')
      expect(notSetElements.length).toBeGreaterThanOrEqual(3)
    })

    it('should display numeric values for number fields', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      // massdeoppro = 3
      expect(wrapper.text()).toContain('3')
    })
  })
})
