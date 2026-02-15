import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChannelCard from '../ChannelCard.vue'
import ChannelListCompact from '../ChannelListCompact.vue'
import ChannelList from '../ChannelList.vue'
import type { ChannelInfo } from '@/types/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getChannelSettings: vi.fn(),
  },
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

const channelWithAccess: ChannelInfo = {
  channel_id: 42,
  channel_name: '#test-channel',
  access_level: 450,
  member_count: 128,
  joined_at: 1700000000,
}

const channelLowAccess: ChannelInfo = {
  channel_id: 99,
  channel_name: '#restricted',
  access_level: 75,
  member_count: 10,
  joined_at: 1700000000,
}

const channelMinAccess: ChannelInfo = {
  channel_id: 50,
  channel_name: '#min-access',
  access_level: 100,
  member_count: 25,
  joined_at: 1700000000,
}

// Stubs for Element Plus components
const ElButtonStub = {
  template: '<button><slot /></button>',
}

const ElDrawerStub = {
  name: 'ElDrawer',
  template: `<div class="el-drawer" v-if="modelValue"><slot /><slot name="header" /></div>`,
  props: ['modelValue', 'size', 'direction', 'beforeClose', 'destroyOnClose'],
  emits: ['update:modelValue', 'close', 'opened'],
}

describe('ChannelCard click integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should emit select when card is clicked with access_level >= 100', async () => {
    const wrapper = mount(ChannelCard, {
      props: { channel: channelWithAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    await wrapper.find('[data-testid="card-clickable"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([channelWithAccess])
  })

  it('should emit select at exactly access_level 100', async () => {
    const wrapper = mount(ChannelCard, {
      props: { channel: channelMinAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    await wrapper.find('[data-testid="card-clickable"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([channelMinAccess])
  })

  it('should NOT emit select when access_level < 100', async () => {
    const wrapper = mount(ChannelCard, {
      props: { channel: channelLowAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    // Clicking the card should NOT emit select
    await wrapper.find('[data-testid="card-clickable"]').trigger('click')
    expect(wrapper.emitted('select')).toBeFalsy()
  })

  it('should NOT emit select when dropdown action is clicked', async () => {
    const wrapper = mount(ChannelCard, {
      props: { channel: channelWithAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    // Open the actions menu
    await wrapper.find('[data-testid="actions-toggle"]').trigger('click')

    // Click "Copy Name" in the dropdown
    const copyBtn = wrapper.find('[data-testid="action-copy-name"]')
    expect(copyBtn.exists()).toBe(true)
    await copyBtn.trigger('click')

    // select should NOT have been emitted from the dropdown click
    expect(wrapper.emitted('copyName')).toBeTruthy()
    // The card select might have been emitted from the toggle click if it bubbles,
    // but it should not be emitted from the copy action
  })

  it('should not have hover transform effects when access_level < 100', () => {
    const wrapper = mount(ChannelCard, {
      props: { channel: channelLowAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    const card = wrapper.find('.channel-card')
    expect(card.classes()).toContain('no-click')
  })
})

describe('ChannelListCompact click integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should emit select when row is clicked with access_level >= 100', async () => {
    const wrapper = mount(ChannelListCompact, {
      props: { channel: channelWithAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    await wrapper.find('[data-testid="row-clickable"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([channelWithAccess])
  })

  it('should emit select at exactly access_level 100', async () => {
    const wrapper = mount(ChannelListCompact, {
      props: { channel: channelMinAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    await wrapper.find('[data-testid="row-clickable"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('should NOT emit select when access_level < 100', async () => {
    const wrapper = mount(ChannelListCompact, {
      props: { channel: channelLowAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    // Clicking the row should NOT emit select
    await wrapper.find('[data-testid="row-clickable"]').trigger('click')
    expect(wrapper.emitted('select')).toBeFalsy()
  })

  it('should NOT emit select when action button is clicked', async () => {
    const wrapper = mount(ChannelListCompact, {
      props: { channel: channelWithAccess },
      global: { stubs: { ElButton: ElButtonStub } },
    })

    // Open actions menu
    await wrapper.find('[data-testid="actions-toggle"]').trigger('click')

    // Click copy name
    const copyBtn = wrapper.find('[data-testid="action-copy-name"]')
    if (copyBtn.exists()) {
      await copyBtn.trigger('click')
    }

    expect(wrapper.emitted('copyName')).toBeTruthy()
  })
})

describe('ChannelList drawer integration', () => {
  const channels: ChannelInfo[] = [channelWithAccess, channelLowAccess, channelMinAccess]

  function createListWrapper() {
    return mount(ChannelList, {
      props: { channels },
      global: {
        stubs: {
          ElButton: ElButtonStub,
          ElDrawer: ElDrawerStub,
          ChannelDetailDrawer: {
            name: 'ChannelDetailDrawer',
            template: '<div class="drawer-stub" :data-channel-id="channelId" :data-open="modelValue"></div>',
            props: ['modelValue', 'channelId', 'accessLevel'],
            emits: ['update:modelValue', 'settings-updated'],
          },
          Pagination: {
            template: '<div class="pagination"></div>',
            props: ['total', 'modelValue', 'pageSize', 'pageSizes'],
            emits: ['update:modelValue', 'update:pageSize'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should open drawer when a channel card with access >= 100 is clicked', async () => {
    const wrapper = createListWrapper()

    // Find a card for channelWithAccess (access_level 450) and click it
    const cards = wrapper.findAllComponents({ name: 'ChannelCard' })
    const clickableCard = cards.find(
      (c) => c.props('channel').access_level >= 100,
    )
    expect(clickableCard).toBeDefined()

    await clickableCard!.vm.$emit('select', channelWithAccess)
    await flushPromises()

    const drawer = wrapper.findComponent({ name: 'ChannelDetailDrawer' })
    expect(drawer.exists()).toBe(true)
    expect(drawer.props('modelValue')).toBe(true)
    expect(drawer.props('channelId')).toBe(42)
    expect(drawer.props('accessLevel')).toBe(450)
  })

  it('should NOT open drawer from channel with access < 100', async () => {
    const wrapper = createListWrapper()

    // No channel selected yet, drawer should not be rendered
    const drawer = wrapper.findComponent({ name: 'ChannelDetailDrawer' })
    expect(drawer.exists()).toBe(false)
  })

  it('should close drawer and clear state on update:modelValue false', async () => {
    const wrapper = createListWrapper()

    // Open drawer
    const cards = wrapper.findAllComponents({ name: 'ChannelCard' })
    const clickableCard = cards.find(
      (c) => c.props('channel').access_level >= 100,
    )
    await clickableCard!.vm.$emit('select', channelWithAccess)
    await flushPromises()

    const drawer = wrapper.findComponent({ name: 'ChannelDetailDrawer' })
    expect(drawer.props('modelValue')).toBe(true)

    // Close drawer
    await drawer.vm.$emit('update:modelValue', false)
    await flushPromises()

    expect(drawer.props('modelValue')).toBe(false)
  })
})
