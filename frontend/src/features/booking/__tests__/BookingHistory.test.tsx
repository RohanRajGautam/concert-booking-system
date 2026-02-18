import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BookingHistory } from '../BookingHistory'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function withProvider(ui: React.ReactNode) {
  const client = new QueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('BookingHistory', () => {
  it('renders history title', () => {
    withProvider(<BookingHistory />)
    expect(screen.getByText(/Your Bookings/i)).toBeInTheDocument()
  })
})
