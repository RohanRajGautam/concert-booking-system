import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import type { Booking } from '../../types';

export const BookingHistory: React.FC = () => {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>('/bookings/00000000-0000-0000-0000-000000000001');
      return data;
    },
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
