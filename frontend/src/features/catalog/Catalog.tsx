import React, { useState } from 'react';
import { useTiers } from '../../hooks/useTiers';
import { TierCard } from './TierCard';
import { BookingForm } from '../booking/BookingForm';
import { BookingHistory } from '../booking/BookingHistory';
import type { Tier, Booking } from '../../types';

export const Catalog: React.FC = () => {
  const { data: tiers, isLoading, isError } = useTiers();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  if (isLoading) {
    return (
      <div className="catalog-grid">
        {[1, 2, 3].map(i => <div key={i} className="card skeleton-shimmer" style={{ height: 200 }} />)}
      </div>
    );
  }

  if (isError) return <div className="error">Failed to load concert tickets. Please refresh.</div>;

  return (
    <div className="container">
      <header>
        <h1>Summer Live 2026</h1>
        <p>Grab your tickets before they're gone!</p>
      </header>
      
      <div className="catalog-grid">
        {tiers?.map(tier => (
          <TierCard key={tier.id} tier={tier} onSelect={setSelectedTier} />
        ))}
      </div>

      <BookingHistory />

      {selectedTier && (
        <BookingForm 
          tier={selectedTier} 
          onSuccess={(b) => {
            setLastBooking(b);
            setSelectedTier(null);
          }} 
          onCancel={() => setSelectedTier(null)} 
        />
      )}

      {lastBooking && (
        <div className="toast success">
          Booking Confirmed! ID: {lastBooking.id.slice(0, 8)}
          <button onClick={() => setLastBooking(null)}>✕</button>
        </div>
      )}
    </div>
  );
};
