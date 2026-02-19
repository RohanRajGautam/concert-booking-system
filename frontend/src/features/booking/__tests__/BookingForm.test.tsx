import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingForm } from '../BookingForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import api from '../../../services/api'
import { AxiosError } from 'axios'

// Mock the API
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock the auth store
vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: any) => selector({
      token: 'mock-token',
      user: { id: 'user-1', username: 'testuser', email: 'test@test.com' },
    }),
    { getState: () => ({ token: 'mock-token' }) }
  ),
}))

const mockTier = {
  id: 'tier-1',
  name: 'VIP',
  price: 15000,
  total_capacity: 100,
  available_seats: 10,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('BookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with tier info', () => {
    renderWithProvider(<BookingForm tier={mockTier} onSuccess={() => {}} onCancel={() => {}} />)
    expect(screen.getByText(/VIP/i)).toBeInTheDocument()
    expect(screen.getByText(/\$150.00/i)).toBeInTheDocument()
  })

  it('submits booking successfully', async () => {
    const onSuccess = vi.fn()
    const mockBooking = { id: 'b-1', total_amount: 15000, quantity: 1 }
    ;(api.post as any).mockResolvedValue({ data: mockBooking })

    renderWithProvider(<BookingForm tier={mockTier} onSuccess={onSuccess} onCancel={() => {}} />)
    
    const submitBtn = screen.getByText(/Confirm & Pay/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockBooking)
    }, { timeout: 3000 })
  })

  it('shows error message on failure', async () => {
    const axiosError = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 404, data: { message: 'Tier not found' }, headers: {}, statusText: 'Not Found', config: {} as any },
    )
    ;(api.post as any).mockRejectedValue(axiosError)

    renderWithProvider(<BookingForm tier={mockTier} onSuccess={() => {}} onCancel={() => {}} />)
    
    const submitBtn = screen.getByText(/Confirm & Pay/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Tier not found/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
