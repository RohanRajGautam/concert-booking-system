import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import type { Booking } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const BookingHistory: React.FC = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>(`/bookings/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="history">
        <h2>Your Bookings</h2>
        <div className="booking-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="booking-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="history">
        <h2>Your Bookings</h2>
        <div className="empty">Something went wrong.</div>
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <div className="history">
        <h2>Your Bookings</h2>
        <div className="empty">No bookings yet.</div>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <h2>Your Bookings ({bookings.length})</h2>
      </div>

      <div className="booking-grid">
        {bookings.map((b) => {
          const unit =
            b.unit_price ?? Math.round(b.total_amount / b.quantity);

          return (
            <div key={b.id} className="booking-card">
              <div className="top">
                <h3>{b.tier_name ?? 'Ticket Tier'}</h3>
                <div className="price">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(b.total_amount / 100)}
                </div>
              </div>

              <div className="meta">
                <span>{b.quantity} tickets</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(unit / 100)} each</span>
              </div>

              <div className="date">
                {new Date(b.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
