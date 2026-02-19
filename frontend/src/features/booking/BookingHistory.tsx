import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import type { Booking } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const BookingHistory: React.FC = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>(`/bookings/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="history">
      <h2>Your Bookings</h2>
      <ul>
        {bookings?.map((b) => (
          <li key={b.id}>{b.tier_name} - {b.quantity} tickets</li>
        ))}
      </ul>
    </div>
  );
};
