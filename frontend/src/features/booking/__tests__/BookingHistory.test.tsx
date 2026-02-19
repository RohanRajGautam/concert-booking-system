import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BookingHistory } from '../BookingHistory'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the auth store
vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({
    token: 'mock-token',
    user: { id: 'user-1', username: 'testuser', email: 'test@test.com' },
  }),
}))

// Mock the API
vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

function withProvider(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('BookingHistory', () => {
  it('renders history title', async () => {
    withProvider(<BookingHistory />)
    await waitFor(() => {
      expect(screen.getByText(/Your Bookings/i)).toBeInTheDocument()
    })
  })
})
