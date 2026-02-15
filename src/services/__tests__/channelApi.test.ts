import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiService from '@/services/api'
import type {
  ChannelSettings,
  ChannelDetailResponse,
  UpdateChannelSettingsRequest,
  UpdateChannelSettingsResponse,
} from '@/types/api'

// Mock axios to intercept HTTP calls
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  }
})

// Get the mocked axios instance
import axios from 'axios'
const mockAxios = axios.create() as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockChannelSettings: ChannelSettings = {
  autojoin: true,
  autotopic: false,
  description: 'Test channel',
  floatgrace: 1,
  floatlim: true,
  floatmargin: 3,
  floatmax: 50,
  floatperiod: 20,
  keywords: 'test,channel',
  massdeoppro: 5,
  noop: false,
  strictop: true,
  url: 'https://example.com',
  userflags: 0,
}

const mockChannelDetailResponse: ChannelDetailResponse = {
  id: 42,
  name: '#test-channel',
  created_at: 1700000000,
  updated_at: 1700001000,
  member_count: 15,
  settings: mockChannelSettings,
}

describe('Channel API Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getChannelSettings', () => {
    it('should call GET /channels/{id} and return channel detail response', async () => {
      mockAxios.get.mockResolvedValue({ data: mockChannelDetailResponse })

      const result = await apiService.getChannelSettings(42)

      expect(mockAxios.get).toHaveBeenCalledWith('/channels/42')
      expect(result).toEqual(mockChannelDetailResponse)
    })

    it('should call GET with the correct channel id', async () => {
      mockAxios.get.mockResolvedValue({ data: mockChannelDetailResponse })

      await apiService.getChannelSettings(99)

      expect(mockAxios.get).toHaveBeenCalledWith('/channels/99')
    })
  })

  describe('updateChannelSettings', () => {
    it('should call PATCH /channels/{id} with correct body', async () => {
      const updateData: UpdateChannelSettingsRequest = {
        description: 'Updated description',
        autojoin: false,
        noop: true,
      }

      const updatedResponse: UpdateChannelSettingsResponse = {
        ...mockChannelDetailResponse,
        settings: {
          ...mockChannelSettings,
          ...updateData,
        },
      }

      mockAxios.patch.mockResolvedValue({ data: updatedResponse })

      const result = await apiService.updateChannelSettings(42, updateData)

      expect(mockAxios.patch).toHaveBeenCalledWith('/channels/42', updateData)
      expect(result).toEqual(updatedResponse)
    })

    it('should only include provided fields in PATCH request body', async () => {
      const partialUpdate: UpdateChannelSettingsRequest = {
        url: 'https://new-url.com',
      }

      mockAxios.patch.mockResolvedValue({ data: mockChannelDetailResponse })

      await apiService.updateChannelSettings(42, partialUpdate)

      // Verify only the provided field is sent
      const callArgs = mockAxios.patch.mock.calls[0] as unknown[]
      expect(callArgs[1]).toEqual({ url: 'https://new-url.com' })
      expect(callArgs[1]).not.toHaveProperty('autojoin')
      expect(callArgs[1]).not.toHaveProperty('description')
    })

    it('should call PATCH with the correct channel id', async () => {
      const updateData: UpdateChannelSettingsRequest = {
        floatmax: 100,
      }

      mockAxios.patch.mockResolvedValue({ data: mockChannelDetailResponse })

      await apiService.updateChannelSettings(77, updateData)

      expect(mockAxios.patch).toHaveBeenCalledWith('/channels/77', updateData)
    })
  })
})
