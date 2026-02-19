import React from 'react';
import type { Booking } from '../../types';

interface ConfirmationProps {
  booking: Booking;
  onClose: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ booking, onClose }) => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ 
          width: '80px', height: '80px', background: 'var(--success)', color: 'white',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 2rem'
        }}>
          ✓
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your tickets have been reserved. A confirmation email will be sent shortly.
        </p>

        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Booking ID:</span>
            <code style={{ fontSize: '0.8rem' }}>{booking.id}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
            <span>{booking.quantity}x Tickets</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${(booking.total_amount / 100).toFixed(2)}</span>
          </div>
        </div>

        <button className="primary" onClick={onClose} style={{ width: '100%' }}>
          Back to Catalog
        </button>
      </div>
    </div>
  );
};
