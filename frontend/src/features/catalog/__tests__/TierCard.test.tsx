import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TierCard } from '../TierCard'

const baseTier = {
  id: 'tier-vip',
  name: 'VIP',
  price: 10000,
  total_capacity: 50,
  available_seats: 30,
}

describe('TierCard', () => {
  it('renders tier name', () => {
    render(<TierCard tier={baseTier} onSelect={() => {}} />)
    expect(screen.getByText('VIP')).toBeInTheDocument()
  })
})
