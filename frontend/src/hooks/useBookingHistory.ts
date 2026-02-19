import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Booking } from '../types';

export function useBookingHistory(userId: string) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${userId}`);
      return data;
    },
    enabled: !!userId
  });
}
