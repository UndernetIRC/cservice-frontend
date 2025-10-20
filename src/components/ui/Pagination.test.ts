import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from './Pagination.vue'

describe('Pagination Component', () => {
  describe('Initial Rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      expect(wrapper.find('.pagination').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.findAll('button')).toHaveLength(12) // Prev + 10 pages + Next
    })

    it('should render correct number of pages', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 50,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(5) // 5 pages total
    })

    it('should render single page when total < pageSize', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 5,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(1) // Only 1 page
    })
  })

  describe('Page Navigation', () => {
    it('should disable Previous button on first page', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const prevButton = wrapper.findAll('button')[0]
      expect(prevButton.attributes('disabled')).toBeDefined()
    })

    it('should enable Previous button when not on first page', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 5,
          pageSize: 10,
        },
      })

      const prevButton = wrapper.findAll('button')[0]
      expect(prevButton.attributes('disabled')).toBeUndefined()
    })

    it('should disable Next button on last page', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 10, // Last page (100 items / 10 per page = 10 pages)
          pageSize: 10,
        },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('should enable Next button when not on last page', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      expect(nextButton.attributes('disabled')).toBeUndefined()
    })

    it('should emit update:modelValue when clicking next', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      await nextButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
    })

    it('should emit update:modelValue when clicking prev', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 5,
          pageSize: 10,
        },
      })

      const prevButton = wrapper.findAll('button')[0]
      await prevButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
    })

    it('should emit update:modelValue when clicking page number', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      await pageButtons[2].trigger('click') // Click page 3

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
    })
  })

  describe('Page Size Selection', () => {
    it('should render default page sizes', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const select = wrapper.find('select')
      const options = select.findAll('option')

      expect(options).toHaveLength(4) // Default: [5, 10, 20, 50]
      expect(options[0].text()).toBe('5')
      expect(options[1].text()).toBe('10')
      expect(options[2].text()).toBe('20')
      expect(options[3].text()).toBe('50')
    })

    it('should render custom page sizes', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
          pageSizes: [10, 25, 50, 100],
        },
      })

      const select = wrapper.find('select')
      const options = select.findAll('option')

      expect(options).toHaveLength(4)
      expect(options[0].text()).toBe('10')
      expect(options[1].text()).toBe('25')
      expect(options[2].text()).toBe('50')
      expect(options[3].text()).toBe('100')
    })

    it('should emit update:pageSize when changing size', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const select = wrapper.find('select')
      await select.setValue('20')

      expect(wrapper.emitted('update:pageSize')).toBeTruthy()
      expect(wrapper.emitted('update:pageSize')?.[0]).toEqual([20])
    })

    it('should reset to page 1 when changing page size', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 5,
          pageSize: 10,
        },
      })

      const select = wrapper.find('select')
      await select.setValue('20')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    })
  })

  describe('Current Page Styling', () => {
    it('should highlight current page button', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 5,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      const currentPageButton = pageButtons[4] // Page 5 (0-indexed)

      const classes = currentPageButton.classes()
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-white')
    })

    it('should not highlight non-current pages', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 5,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      const otherPageButton = pageButtons[0] // Page 1

      const classes = otherPageButton.classes()
      expect(classes).not.toContain('bg-primary')
      expect(classes).toContain('bg-gray-200')
    })
  })

  describe('Edge Cases', () => {
    it('should handle total = 0', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 0,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(0)
    })

    it('should handle total = pageSize (exactly 1 page)', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 10,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(1)

      const buttons = wrapper.findAll('button')
      const prevButton = buttons[0]
      const nextButton = buttons[buttons.length - 1]

      expect(prevButton.attributes('disabled')).toBeDefined()
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('should handle large total values', () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 10000,
          modelValue: 1,
          pageSize: 100,
        },
      })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(100) // 10000 / 100 = 100 pages
    })

    it('should not go below page 1 when clicking prev', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      const prevButton = wrapper.findAll('button')[0]

      // Try clicking prev when already on page 1
      await prevButton.trigger('click')

      // Should not emit anything since button is disabled
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should not go beyond last page when clicking next', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 10,
          pageSize: 10,
        },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]

      // Try clicking next when already on last page
      await nextButton.trigger('click')

      // Should not emit anything since button is disabled
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('Props Reactivity', () => {
    it('should update when modelValue prop changes', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      await wrapper.setProps({ modelValue: 5 })

      const pageButtons = wrapper.findAll('li button')
      const currentPageButton = pageButtons[4]

      expect(currentPageButton.classes()).toContain('bg-primary')
    })

    it('should update when pageSize prop changes', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      await wrapper.setProps({ pageSize: 20 })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(5) // 100 / 20 = 5 pages
    })

    it('should recalculate total pages when total changes', async () => {
      const wrapper = mount(Pagination, {
        props: {
          total: 100,
          modelValue: 1,
          pageSize: 10,
        },
      })

      await wrapper.setProps({ total: 50 })

      const pageButtons = wrapper.findAll('li button')
      expect(pageButtons).toHaveLength(5) // 50 / 10 = 5 pages
    })
  })
})
