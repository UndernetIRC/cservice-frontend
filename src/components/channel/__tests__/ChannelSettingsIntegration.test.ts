import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChannelDetailDrawer from '../ChannelDetailDrawer.vue'
import ChannelSettingsForm from '../ChannelSettingsForm.vue'
import ElementPlus from 'element-plus'
import type { ChannelDetailResponse, ChannelSettings } from '@/types/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getChannelSettings: vi.fn(),
    updateChannelSettings: vi.fn(),
  },
}))

import apiService from '@/services/api'

const mockSettings: ChannelSettings = {
  autojoin: true,
  autotopic: false,
  description: 'Test channel',
  url: 'https://example.com',
  keywords: 'test',
  userflags: 1,
  noop: false,
  strictop: true,
  massdeoppro: 3,
  floatlim: true,
  floatgrace: 5,
  floatmargin: 10,
  floatmax: 500,
  floatperiod: 60,
}

const mockChannelData: ChannelDetailResponse = {
  id: 42,
  name: '#test-channel',
  created_at: 1700000000,
  updated_at: 1700086400,
  member_count: 128,
  settings: mockSettings,
}

const mockChannelData2: ChannelDetailResponse = {
  id: 99,
  name: '#another-channel',
  created_at: 1700000000,
  updated_at: 1700086400,
  member_count: 64,
  settings: {
    ...mockSettings,
    description: 'Another channel',
    autojoin: false,
  },
}

// Stub Element Plus drawer
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
      plugins: [ElementPlus],
      stubs: {
        ElDrawer: ElDrawerStub,
      },
    },
  })
}

describe('Channel Settings Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Full flow integration', () => {
    it('should complete full flow: open drawer -> fetch -> display read-only -> edit -> modify -> save -> PATCH with dirty fields only', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockResolvedValue({
        ...mockChannelData,
        settings: { ...mockSettings, description: 'Updated description' },
      })

      const wrapper = createWrapper({ accessLevel: 500 })

      // Step 1: Drawer opens and fetches settings
      await flushPromises()
      expect(apiService.getChannelSettings).toHaveBeenCalledWith(42)
      expect(wrapper.text()).toContain('test-channel')

      // Step 2: Display read-only view
      expect(wrapper.text()).toContain('Test channel')
      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)

      // Step 3: Click edit button
      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      // Step 4: Form should be visible
      const form = wrapper.findComponent(ChannelSettingsForm)
      expect(form.exists()).toBe(true)

      // Step 5: Modify a field
      form.vm.onFieldChange('description', 'Updated description')
      await nextTick()

      expect(form.vm.dirtyFields.has('description')).toBe(true)
      expect(form.vm.dirtyCount).toBe(1)

      // Step 6: Save changes
      await form.vm.handleSave()
      await flushPromises()

      // Step 7: Verify PATCH was called with only dirty fields
      expect(apiService.updateChannelSettings).toHaveBeenCalledWith(42, {
        description: 'Updated description',
      })

      // Step 8: Verify drawer refetched settings after save
      expect(apiService.getChannelSettings).toHaveBeenCalledTimes(2)
    })
  })

  describe('Access boundary (< 100)', () => {
    it('should not show edit button for users with access level < 100', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 75 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(false)
    })
  })

  describe('Permission boundary (100)', () => {
    it('should show read-only view with no edit button for access level 100', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 100 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('General')
      expect(wrapper.text()).toContain('Protection')
      expect(wrapper.text()).toContain('Automation')
      expect(wrapper.text()).toContain('Float Limit')
    })
  })

  describe('Permission boundary (449)', () => {
    it('should show read-only view with no edit button for access level 449', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 449 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(false)
      expect(wrapper.findAll('[data-testid="setting-group"]')).toHaveLength(4)
    })
  })

  describe('Permission boundary (450)', () => {
    it('should show edit button and only allow editing General fields for access level 450', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 450 })
      await flushPromises()

      // Edit button should be visible
      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)

      // Click edit
      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      expect(form.exists()).toBe(true)

      // Only General group should be visible in edit mode
      const groupHeaders = form.findAll('[data-testid="group-header"]')
      expect(groupHeaders).toHaveLength(1)
      expect(groupHeaders[0]!.text()).toBe('General')
    })

    it('should successfully save changes to General fields with access level 450', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockResolvedValue({
        ...mockChannelData,
        settings: { ...mockSettings, url: 'https://new-url.com' },
      })

      const wrapper = createWrapper({ accessLevel: 450 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      form.vm.onFieldChange('url', 'https://new-url.com')
      await nextTick()

      await form.vm.handleSave()
      await flushPromises()

      expect(apiService.updateChannelSettings).toHaveBeenCalledWith(42, {
        url: 'https://new-url.com',
      })
    })
  })

  describe('Permission boundary (500)', () => {
    it('should show edit button and allow editing all fields for access level 500', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      const groupHeaders = form.findAll('[data-testid="group-header"]')

      // All 4 groups should be visible
      expect(groupHeaders).toHaveLength(4)
      expect(groupHeaders.map((h) => h.text())).toEqual([
        'General',
        'Protection',
        'Automation',
        'Float Limit',
      ])
    })

    it('should successfully save changes to Protection fields with access level 500', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockResolvedValue({
        ...mockChannelData,
        settings: { ...mockSettings, strictop: false },
      })

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      form.vm.onFieldChange('strictop', false)
      await nextTick()

      await form.vm.handleSave()
      await flushPromises()

      expect(apiService.updateChannelSettings).toHaveBeenCalledWith(42, {
        strictop: false,
      })
    })
  })

  describe('Level 450 edit mode restrictions', () => {
    it('should NOT show Protection, Automation, or Float Limit groups in edit mode for level 450', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 450 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      const text = form.text()

      expect(text).toContain('General')
      expect(text).not.toContain('Protection')
      expect(text).not.toContain('Automation')
      expect(text).not.toContain('Float Limit')
    })
  })

  describe('Concurrent drawer opens', () => {
    it('should swap content when opening a new channel while drawer is already open', async () => {
      vi.mocked(apiService.getChannelSettings)
        .mockResolvedValueOnce(mockChannelData)
        .mockResolvedValueOnce(mockChannelData2)

      const wrapper = createWrapper({ channelId: 42 })
      await flushPromises()

      // First channel loaded
      expect(apiService.getChannelSettings).toHaveBeenCalledWith(42)
      expect(wrapper.text()).toContain('test-channel')
      expect(wrapper.text()).toContain('Test channel')

      // Switch to another channel while drawer is still open
      await wrapper.setProps({ channelId: 99 })
      await flushPromises()

      // Second channel should be loaded
      expect(apiService.getChannelSettings).toHaveBeenCalledWith(99)
      expect(wrapper.text()).toContain('another-channel')
      expect(wrapper.text()).toContain('Another channel')
      expect(wrapper.text()).not.toContain('Test channel')
    })

    it('should reset edit mode when switching channels', async () => {
      vi.mocked(apiService.getChannelSettings)
        .mockResolvedValueOnce(mockChannelData)
        .mockResolvedValueOnce(mockChannelData2)

      const wrapper = createWrapper({ channelId: 42, accessLevel: 500 })
      await flushPromises()

      // Enter edit mode
      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load
      expect(wrapper.findComponent(ChannelSettingsForm).exists()).toBe(true)

      // Switch channels
      await wrapper.setProps({ channelId: 99 })
      await flushPromises()

      // Edit mode should be reset (back to read-only view)
      expect(wrapper.findComponent(ChannelSettingsForm).exists()).toBe(false)
      expect(wrapper.find('[data-testid="edit-settings-btn"]').exists()).toBe(true)
    })
  })

  describe('Network error during fetch', () => {
    it('should show error state with retry button on fetch failure', async () => {
      vi.mocked(apiService.getChannelSettings).mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      await flushPromises()
      await nextTick() // Additional tick for error state rendering

      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Failed to load channel settings')
      expect(wrapper.find('[data-testid="retry-btn"]').exists()).toBe(true)
    })

    it('should retry fetch when retry button is clicked after network error', async () => {
      vi.mocked(apiService.getChannelSettings)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockChannelData)

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(apiService.getChannelSettings).toHaveBeenCalledTimes(1)

      // Click retry
      await wrapper.find('[data-testid="retry-btn"]').trigger('click')
      await flushPromises()

      // Should have called API again and succeeded
      expect(apiService.getChannelSettings).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('test-channel')
    })
  })

  describe('Network error during save', () => {
    it('should keep form in edit mode with error notification on save failure', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockRejectedValue({
        response: { data: { message: 'Network error' } },
      })

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      form.vm.onFieldChange('description', 'Updated')
      await nextTick()

      expect(form.vm.dirtyCount).toBe(1)

      await form.vm.handleSave()
      await flushPromises()

      // Form should still be in edit mode with dirty state preserved
      expect(form.exists()).toBe(true)
      expect(form.vm.dirtyCount).toBe(1)
      expect(form.vm.formData.description).toBe('Updated')
    })
  })

  describe('403 response handling', () => {
    it('should handle 403 Forbidden response during fetch', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { message: 'Insufficient permissions' },
        },
      }
      vi.mocked(apiService.getChannelSettings).mockRejectedValue(forbiddenError)

      const wrapper = createWrapper()
      await flushPromises()
      await nextTick() // Additional tick for error state rendering

      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Failed to load channel settings')
    })

    it('should handle 403 Forbidden response during save', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { message: 'Insufficient permissions to modify this channel' },
        },
      }
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockRejectedValue(forbiddenError)

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      form.vm.onFieldChange('description', 'Updated')
      await nextTick()

      await form.vm.handleSave()
      await flushPromises()

      // Form should remain in edit mode, error message should be shown via ElMessage
      expect(form.exists()).toBe(true)
      expect(form.vm.dirtyCount).toBe(1)
      expect(apiService.updateChannelSettings).toHaveBeenCalled()
    })
  })

  describe('Multiple field changes integration', () => {
    it('should send all dirty fields in PATCH request when multiple fields are modified', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockResolvedValue({
        ...mockChannelData,
        settings: {
          ...mockSettings,
          description: 'New desc',
          url: 'https://new.com',
          keywords: 'new,keywords',
        },
      })

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      expect(form.exists()).toBe(true) // Verify form loaded

      // Modify multiple fields
      form.vm.onFieldChange('description', 'New desc')
      form.vm.onFieldChange('url', 'https://new.com')
      form.vm.onFieldChange('keywords', 'new,keywords')
      await nextTick()

      expect(form.vm.dirtyCount).toBe(3)

      await form.vm.handleSave()
      await flushPromises()

      // All dirty fields should be sent
      expect(apiService.updateChannelSettings).toHaveBeenCalledWith(42, {
        description: 'New desc',
        url: 'https://new.com',
        keywords: 'new,keywords',
      })
    })

    it('should not send unchanged fields in PATCH request', async () => {
      vi.mocked(apiService.getChannelSettings).mockResolvedValue(mockChannelData)
      vi.mocked(apiService.updateChannelSettings).mockResolvedValue(mockChannelData)

      const wrapper = createWrapper({ accessLevel: 500 })
      await flushPromises()

      await wrapper.find('[data-testid="edit-settings-btn"]').trigger('click')
      await nextTick()
      await flushPromises() // Wait for async component to load

      const form = wrapper.findComponent(ChannelSettingsForm)
      expect(form.exists()).toBe(true) // Verify form loaded

      // Change a field then revert it
      form.vm.onFieldChange('description', 'Changed')
      form.vm.onFieldChange('description', 'Test channel') // Revert to original
      await nextTick()

      expect(form.vm.dirtyCount).toBe(0)

      // Change only one field
      form.vm.onFieldChange('autojoin', false)
      await nextTick()

      await form.vm.handleSave()
      await flushPromises()

      // Only the changed field should be sent
      expect(apiService.updateChannelSettings).toHaveBeenCalledWith(42, {
        autojoin: false,
      })

      // Verify no other fields were included
      const callArgs = vi.mocked(apiService.updateChannelSettings).mock.calls[0]!
      expect(callArgs[1]).not.toHaveProperty('description')
      expect(callArgs[1]).not.toHaveProperty('url')
      expect(callArgs[1]).not.toHaveProperty('keywords')
    })
  })
})
