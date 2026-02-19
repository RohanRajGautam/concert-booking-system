import React from 'react';
import type { Tier } from '../../types';

interface TierCardProps {
  tier: Tier;
  onSelect: (tier: Tier) => void;
}

export const TierCard: React.FC<TierCardProps> = ({ tier, onSelect }) => {
  const soldOut = tier.available_seats === 0;
  const percentage = Math.max(
    0,
    Math.min(100, (tier.available_seats / tier.total_capacity) * 100)
  );
  const sellingFast = percentage <= 10 && !soldOut;

  return (
    <div className={`card ${soldOut ? 'sold-out' : ''}`} style={{ position: 'relative' }}>
      {sellingFast && <span className="badge warning">Selling Fast!</span>}
      {soldOut && <span className="badge danger">Sold Out</span>}

      <div className="card-header">
        <h3>{tier.name}</h3>
        <p className="price">${(tier.price / 100)}</p>
      </div>

      <div className="card-body">
        <div className="availability">
          <div className="progress-bar-container">
            <div
              className={`progress-bar ${tier.available_seats < tier.total_capacity * 0.1 ? 'warning' : ''}`}
              style={{ width: `${(tier.available_seats / tier.total_capacity) * 100}%` }}
            />
          </div>
          <span className="availability-text">
            {tier.available_seats} / {tier.total_capacity} seats left
          </span>
        </div>
      </div>

      <button
        className="primary"
        onClick={() => onSelect(tier)}
        disabled={soldOut}
        aria-label={soldOut ? `${tier.name} — Sold Out` : `Book ${tier.name}`}
      >
        {soldOut ? 'Sold Out' : 'Select Seats'}
      </button>
    </div>
  );
};
