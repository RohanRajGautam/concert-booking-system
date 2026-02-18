import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingForm } from '../BookingForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import api from '../../../services/api'

// Mock the API
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockTier = {
  id: 'tier-1',
  name: 'VIP',
  price: 15000,
  total_capacity: 100,
  available_tickets: 10
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

  it('updates total amount when quantity changes', async () => {
    renderWithProvider(<BookingForm tier={mockTier} onSuccess={() => {}} onCancel={() => {}} />)
    const input = screen.getByLabelText(/Quantity/i)
    fireEvent.change(input, { target: { value: '2' } })
    expect(screen.getByText(/\$300.00/i)).toBeInTheDocument()
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
    ;(api.post as any).mockRejectedValue({
      response: { data: { error: 'Tier not found' } }
    })

    renderWithProvider(<BookingForm tier={mockTier} onSuccess={() => {}} onCancel={() => {}} />)
    
    const submitBtn = screen.getByText(/Confirm & Pay/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Tier not found/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
