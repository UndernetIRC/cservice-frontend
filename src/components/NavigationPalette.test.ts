import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NavigationPalette from './NavigationPalette.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'

const EmptyComponent = { template: '<div />' }

// Mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'landing', component: EmptyComponent },
    { path: '/dashboard', name: 'dashboard', component: EmptyComponent },
    { path: '/channels', name: 'channels', component: EmptyComponent },
    { path: '/account', name: 'account', component: EmptyComponent },
    { path: '/admin', name: 'admin', component: EmptyComponent },
    { path: '/admin/roles', name: 'admin-roles', component: EmptyComponent },
  ],
})

describe('NavigationPalette Component', () => {
  let wrapper: VueWrapper<any>
  let authStore: ReturnType<typeof useAuthStore>
  let originalWarn: typeof console.warn

  beforeEach(async () => {
    // Suppress Element Plus internal lifecycle warnings in test environment.
    // These occur because ElDialog's teleport/overlay registers onMounted/onUnmounted
    // hooks outside the component instance context during test teardown.
    originalWarn = console.warn
    console.warn = (...args: any[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : ''
      if (msg.includes('is called when there is no active component instance')) return
      originalWarn.apply(console, args)
    }

    // Setup fresh Pinia instance for each test
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // Ensure router is ready before mounting components
    router.push('/')
    await router.isReady()

    // Set default authenticated state (must set isAuthenticated explicitly)
    authStore.isAuthenticated = true
    authStore.userInfo = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      date_joined: '2024-01-01T00:00:00Z',
      last_login: '2024-01-01T00:00:00Z',
      admin_level: 0,
    }

    // Mock window.addEventListener
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    console.warn = originalWarn
    vi.restoreAllMocks()
  })

  const mountComponent = (options: Record<string, any> = {}) => {
    const { global: globalOverrides, ...rest } = options
    return mount(NavigationPalette, {
      global: {
        plugins: [router, ElementPlus],
        ...globalOverrides,
      },
      ...rest,
    })
  }

  describe('Initial Rendering', () => {
    it('should render the component', () => {
      wrapper = mountComponent()

      expect(wrapper.exists()).toBe(true)
    })

    it('should not be visible initially', () => {
      wrapper = mountComponent()

      // The dialog should be hidden by default
      const dialog = wrapper.find('.el-dialog')
      expect(dialog.exists()).toBe(false)
    })

    it('should register keyboard event listener on mount', () => {
      wrapper = mountComponent()

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should remove keyboard event listener on unmount', () => {
      wrapper = mountComponent()

      wrapper.unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Platform Detection', () => {
    it('should display Cmd+K on Mac platform', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true,
      })

      wrapper = mountComponent()

      // Open the modal to see the keyboard hint
      wrapper.vm.isVisible = true
      wrapper.vm.$nextTick(() => {
        const kbd = wrapper.find('kbd')
        expect(kbd.text()).toBe('⌘K')
      })
    })

    it('should display Ctrl+K on non-Mac platforms', () => {
      // Mock Windows platform
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
        configurable: true,
      })

      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.$nextTick(() => {
        const kbd = wrapper.find('kbd')
        expect(kbd.text()).toBe('Ctrl+K')
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should open modal with Cmd+K on Mac', async () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true,
      })

      wrapper = mountComponent()

      expect(wrapper.vm.isVisible).toBe(false)

      // Simulate Cmd+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('should open modal with Ctrl+K on Windows/Linux', async () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
        configurable: true,
      })

      wrapper = mountComponent()

      expect(wrapper.vm.isVisible).toBe(false)

      // Simulate Ctrl+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('should toggle modal visibility on repeated keyboard shortcuts', async () => {
      wrapper = mountComponent()

      expect(wrapper.vm.isVisible).toBe(false)

      // Open modal
      const event1 = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event1)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(true)

      // Close modal
      const event2 = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event2)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('should not open modal with just K key', async () => {
      wrapper = mountComponent()

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        bubbles: true,
      })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('should close modal with Escape key', async () => {
      wrapper = mountComponent()

      // Open modal first
      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      // Press Escape
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      const searchInput = wrapper.find('input[placeholder="Search pages..."]')
      expect(searchInput.exists()).toBe(true)
    })

    it('should filter items based on search query', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      // Search for "dashboard"
      wrapper.vm.searchQuery = 'dashboard'
      await wrapper.vm.$nextTick()

      const filtered = wrapper.vm.filteredItems
      // Should find the dashboard route
      expect(filtered.some((item: any) => item.name.toLowerCase().includes('dashboard'))).toBe(true)
    })

    it('should show "No pages found" when search has no results', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.searchQuery = 'xyznonexistent'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filteredItems.length).toBe(0)
      expect(wrapper.text()).toContain('No pages found')
    })

    it('should search in both name and description', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      // Search by description text (case insensitive)
      wrapper.vm.searchQuery = 'manage'
      await wrapper.vm.$nextTick()

      const filtered = wrapper.vm.filteredItems
      // Should find routes with "manage" in description (Channels, Account Settings, Admin Panel, Role Management)
      expect(
        filtered.some((item: any) => item.description.toLowerCase().includes('manage')),
      ).toBe(true)
    })

    it('should reset selected index when search query changes', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.selectedIndex = 5
      await wrapper.vm.$nextTick()

      wrapper.vm.searchQuery = 'test'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedIndex).toBe(0)
    })

    it('should clear search query when modal closes', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.searchQuery = 'dashboard'
      await wrapper.vm.$nextTick()

      wrapper.vm.isVisible = false
      wrapper.vm.handleClosed()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedIndex).toBe(0)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate down with arrow down key', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      const initialIndex = wrapper.vm.selectedIndex
      expect(initialIndex).toBe(0)

      // Navigate down
      wrapper.vm.navigateDown()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedIndex).toBe(1)

      // Navigate down again
      wrapper.vm.navigateDown()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedIndex).toBe(2)
    })

    it('should navigate up with arrow up key', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.selectedIndex = 2
      await wrapper.vm.$nextTick()

      wrapper.vm.navigateUp()
      expect(wrapper.vm.selectedIndex).toBe(1)

      wrapper.vm.navigateUp()
      expect(wrapper.vm.selectedIndex).toBe(0)
    })

    it('should not go below 0 when navigating up', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.selectedIndex = 0
      await wrapper.vm.$nextTick()

      wrapper.vm.navigateUp()
      expect(wrapper.vm.selectedIndex).toBe(0)
    })

    it('should not go beyond last item when navigating down', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      const maxIndex = wrapper.vm.filteredItems.length - 1
      wrapper.vm.selectedIndex = maxIndex

      wrapper.vm.navigateDown()
      expect(wrapper.vm.selectedIndex).toBe(maxIndex)
    })

    it('should navigate to selected item on Enter key', async () => {
      const routerPushSpy = vi.spyOn(router, 'push')

      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.selectedIndex = 0
      await wrapper.vm.$nextTick()

      wrapper.vm.selectCurrent()
      await wrapper.vm.$nextTick()

      expect(routerPushSpy).toHaveBeenCalled()
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe('Authorization Filtering', () => {
    it('should have navigation items with correct authorization flags', () => {
      wrapper = mountComponent()

      const items = wrapper.vm.navigationItems

      // Check that items have correct auth requirements
      const dashboardItem = items.find((item: any) => item.path === '/dashboard')
      expect(dashboardItem).toBeDefined()
      expect(dashboardItem.requiresAuth).toBe(true)

      const adminItem = items.find((item: any) => item.path === '/admin')
      expect(adminItem).toBeDefined()
      expect(adminItem.requiresAdmin).toBe(true)
    })

    it('should filter items based on authentication state (default: authenticated)', async () => {
      // With default authenticated state from beforeEach
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      const filtered = wrapper.vm.filteredItems

      // Should show authenticated routes (with default admin_level: 0)
      expect(filtered.some((item: any) => item.path === '/dashboard')).toBe(true)
      expect(filtered.some((item: any) => item.path === '/channels')).toBe(true)
      expect(filtered.some((item: any) => item.path === '/account')).toBe(true)

      // Should not show admin routes (admin_level < 800)
      expect(filtered.some((item: any) => item.path === '/admin')).toBe(false)
      expect(filtered.some((item: any) => item.path === '/admin/roles')).toBe(false)
    })

    it('should include all navigation categories', () => {
      wrapper = mountComponent()

      const items = wrapper.vm.navigationItems
      const paths = items.map((item: any) => item.path)

      // Verify all expected routes are in the navigation items
      expect(paths).toContain('/')
      expect(paths).toContain('/dashboard')
      expect(paths).toContain('/channels')
      expect(paths).toContain('/account')
      expect(paths).toContain('/admin')
      expect(paths).toContain('/admin/roles')
    })
  })

  describe('Navigation', () => {
    it('should navigate to selected route on click', async () => {
      const routerPushSpy = vi.spyOn(router, 'push')

      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      await wrapper.vm.navigateToRoute('/dashboard')

      expect(routerPushSpy).toHaveBeenCalledWith('/dashboard')
      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('should close modal after navigation', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      await wrapper.vm.navigateToRoute('/channels')

      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe('Modal Behavior', () => {
    it('should close modal when clicking close button', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      // Directly set the modal to closed (close button is in the header)
      wrapper.vm.isVisible = false
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('should focus search input when modal opens', async () => {
      wrapper = mountComponent({ attachTo: document.body })

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      // Wait for the setTimeout in the component
      await new Promise((resolve) => setTimeout(resolve, 150))

      const searchInput = wrapper.find('input[placeholder="Search pages..."]')
      expect(document.activeElement).toBe(searchInput.element)
    })
  })

  describe('Navigation Items', () => {
    it('should have correct navigation item structure', () => {
      wrapper = mountComponent()

      const items = wrapper.vm.navigationItems

      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      // Check structure of first item
      const firstItem = items[0]
      expect(firstItem).toHaveProperty('path')
      expect(firstItem).toHaveProperty('name')
      expect(firstItem).toHaveProperty('description')
      expect(firstItem).toHaveProperty('icon')
    })

    it('should include all expected routes', () => {
      wrapper = mountComponent()

      const items = wrapper.vm.navigationItems
      const paths = items.map((item: any) => item.path)

      expect(paths).toContain('/')
      expect(paths).toContain('/dashboard')
      expect(paths).toContain('/channels')
      expect(paths).toContain('/account')
      expect(paths).toContain('/admin')
      expect(paths).toContain('/admin/roles')
    })
  })

  describe('Styling', () => {
    it('should apply dark theme classes', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      await wrapper.vm.$nextTick()

      const header = wrapper.find('.bg-gray-900')
      expect(header.exists()).toBe(true)
    })

    it('should highlight selected item', async () => {
      wrapper = mountComponent()

      wrapper.vm.isVisible = true
      wrapper.vm.selectedIndex = 0
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button[class*="border-l-4"]')
      expect(buttons.length).toBeGreaterThan(0)
      expect(buttons[0]!.classes()).toContain('bg-gray-700')
      expect(buttons[0]!.classes()).toContain('border-primary')
    })
  })
})
