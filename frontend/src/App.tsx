import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Catalog } from './features/catalog/Catalog'
import { BookingForm } from './features/booking/BookingForm'
import { Confirmation } from './features/confirmation/Confirmation'
import { BookingHistory } from './features/booking/BookingHistory'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { useAuthStore } from './store/useAuthStore'
import type { Tier, Booking } from './types'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function MainLayout() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [lastBooking, setLastBooking] = useState<Booking | null>(null)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleBookingSuccess = (booking: Booking) => {
    setLastBooking(booking)
    setSelectedTier(null)
  }

  return (
    <div className="min-h-screen">
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>CONCERT<span style={{ color: 'var(--primary)' }}>NP</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Signed in as <strong style={{ color: 'var(--accent)' }}>{user?.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.375rem',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Logout
          </button>
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
