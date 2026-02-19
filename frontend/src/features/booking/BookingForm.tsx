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
        quantity,
        idempotencyKey: crypto.randomUUID(),
      });
      return data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess(booking);
    },
  });

  const totalCents = tier.price * quantity;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Booking</h2>
        <p className="tier-name">{tier.name}</p>

        <div className="quantity-container">
          <button
            className="stepper-button"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="quantity">{quantity}</span>
          <button
            className="stepper-button"
            onClick={() => setQuantity(q => Math.min(tier.available_seats, q + 1))}
            disabled={quantity >= tier.available_seats}
          >
            +
          </button>
        </div>

        <div className="price-summary">
          Total: <span className="total-price">${(totalCents)}</span>
        </div>

        {mutation.isError && (
          <p className="error">{resolveErrorMessage(mutation.error)}</p>
        )}

        <div className="actions">
          <button
            className="btn cancel"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};
