import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Tier } from '../types';

export function useTiers() {
  return useQuery<Tier[]>({
    queryKey: ['tiers'],
    queryFn: async () => {
      const { data } = await api.get<Tier[]>('/tiers');
      return data;
    },
    refetchInterval: 30_000,
  });
}
