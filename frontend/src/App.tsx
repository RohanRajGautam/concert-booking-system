import { useState } from 'react'
import { Catalog } from './features/catalog/Catalog'
import { BookingForm } from './features/booking/BookingForm'
import { Confirmation } from './features/confirmation/Confirmation'
import { BookingHistory } from './features/booking/BookingHistory'
import type { Tier, Booking } from './types'
import { useUserStore } from './store/useUserStore'

function App() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [lastBooking, setLastBooking] = useState<Booking | null>(null)
  const { userId } = useUserStore()

  const handleBookingSuccess = (booking: Booking) => {
    setLastBooking(booking)
    setSelectedTier(null)
  }

  return (
    <div className="min-h-screen">
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>CONCERT<span style={{ color: 'var(--primary)' }}>TIX</span></div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Session: <code style={{ color: 'var(--accent)' }}>{userId.slice(0, 8)}...</code>
        </div>
      </nav>

      {lastBooking ? (
        <Confirmation 
          booking={lastBooking} 
          onClose={() => setLastBooking(null)} 
        />
      ) : (
        <>
          <Catalog onSelectTier={(tier) => setSelectedTier(tier)} />
          <BookingHistory />
        </>
      )}

      {selectedTier && (
        <BookingForm 
          tier={selectedTier} 
          onCancel={() => setSelectedTier(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}

export default App
