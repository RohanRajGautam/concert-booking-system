import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Tier, Booking } from '../../types';
import axios from 'axios';

interface BookingFormProps {
  tier: Tier;
  onSuccess: (booking: Booking) => void;
  onCancel: () => void;
}

function resolveErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    if (status === 409) return "Someone just grabbed the last seat — try another tier.";
    if (status === 402) return "Payment declined — please try again.";
    return (error.response.data as any)?.message ?? "Booking failed.";
  }
  return "A network error occurred.";
}

export const BookingForm: React.FC<BookingFormProps> = ({ tier, onSuccess, onCancel }) => {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Booking>('/bookings', {
        tierId: tier.id,
        userId: '00000000-0000-0000-0000-000000000001',
        quantity,
        idempotencyKey: crypto.randomUUID(),
      });
      return data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      onSuccess(booking);
    },
  });

  const totalCents = tier.price * quantity;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Booking: {tier.name}</h2>
        <div className="quantity-stepper">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(tier.available_seats, q + 1))} disabled={quantity >= tier.available_seats}>+</button>
        </div>
        <div className="price-summary">
          Total: ${(totalCents / 100).toFixed(2)}
        </div>
        <div className="actions">
          <button onClick={onCancel} disabled={mutation.isPending}>Cancel</button>
          <button className="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
        {mutation.isError && <p className="error">{resolveErrorMessage(mutation.error)}</p>}
      </div>
    </div>
  );
};
