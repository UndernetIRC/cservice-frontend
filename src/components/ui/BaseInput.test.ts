import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput Component', () => {
  describe('Props', () => {
    it('should render with default props', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test Label',
        },
      })

      const input = wrapper.find('input')
      const label = wrapper.find('label')

      expect(input.exists()).toBe(true)
      expect(label.text()).toBe('Test Label')
      expect(input.attributes('type')).toBe('text')
    })

    it('should bind modelValue prop correctly', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 'test value',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('test value')
    })

    it('should use custom type prop', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Password',
          type: 'password',
        },
      })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('password')
    })

    it('should use custom id prop', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
          id: 'custom-id',
        },
      })

      const input = wrapper.find('input')
      const label = wrapper.find('label')

      expect(input.attributes('id')).toBe('custom-id')
      expect(label.attributes('for')).toBe('custom-id')
    })

    it('should generate random id when not provided', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      const id = input.attributes('id')

      expect(id).toBeDefined()
      expect(id).toMatch(/^input-/)
    })
  })

  describe('v-model', () => {
    it('should emit update:modelValue on input', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })

    it('should emit multiple updates', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('first')
      await input.setValue('second')
      await input.setValue('third')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toHaveLength(3)
      expect(emitted?.[0]).toEqual(['first'])
      expect(emitted?.[1]).toEqual(['second'])
      expect(emitted?.[2]).toEqual(['third'])
    })

    it('should work with number modelValue', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 42,
          label: 'Number',
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('42')
    })
  })

  describe('Error State', () => {
    it('should apply error styling when error prop is set', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
          error: 'This field is required',
        },
      })

      const input = wrapper.find('input')
      const classes = input.classes()

      expect(classes).toContain('border-red-500')
      expect(classes).toContain('focus:border-red-500')
      expect(classes).not.toContain('border-slate-600')
    })

    it('should apply default styling when no error', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      const classes = input.classes()

      expect(classes).toContain('border-slate-600')
      expect(classes).toContain('focus:border-primary')
      expect(classes).not.toContain('border-red-500')
    })

    it('should change label color when error is set', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
          error: 'Error message',
        },
      })

      const label = wrapper.find('label')
      const classes = label.classes()

      expect(classes).toContain('text-red-500')
      expect(classes).not.toContain('text-slate-500')
    })
  })

  describe('Accessibility', () => {
    it('should connect label to input via for/id', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email',
          id: 'email-input',
        },
      })

      const input = wrapper.find('input')
      const label = wrapper.find('label')

      expect(label.attributes('for')).toBe('email-input')
      expect(input.attributes('id')).toBe('email-input')
    })

    it('should pass through additional attributes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
        attrs: {
          required: true,
          autocomplete: 'username',
          maxlength: '20',
        },
      })

      const input = wrapper.find('input')

      expect(input.attributes('required')).toBeDefined()
      expect(input.attributes('autocomplete')).toBe('username')
      expect(input.attributes('maxlength')).toBe('20')
    })

    it('should use placeholder attribute for floating label', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe(' ')
    })
  })

  describe('Styling', () => {
    it('should have correct base classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const input = wrapper.find('input')
      const classes = input.classes()

      expect(classes).toContain('peer')
      expect(classes).toContain('block')
      expect(classes).toContain('w-full')
      expect(classes).toContain('rounded-md')
      expect(classes).toContain('border')
    })

    it('should have floating label styles', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Test',
        },
      })

      const label = wrapper.find('label')
      const classes = label.classes()

      expect(classes).toContain('absolute')
      expect(classes).toContain('transform')
      expect(classes).toContain('-translate-y-6')
    })

    it('should render password type correctly', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Password',
          type: 'password',
        },
      })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('password')
      expect(wrapper.find('label').text()).toBe('Password')
    })
  })
})
