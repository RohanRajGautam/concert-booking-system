import React from 'react';
import type { Tier } from '../../types';

interface TierCardProps {
  tier: Tier;
  onSelect: (tier: Tier) => void;
}

export const TierCard: React.FC<TierCardProps> = ({ tier, onSelect }) => {
  const soldOut = tier.available_seats === 0;
  const sellingFast = tier.available_seats < tier.total_capacity * 0.1 && !soldOut;

  return (
    <div className={`card ${soldOut ? 'sold-out' : ''}`}>
      {sellingFast && <span className="badge warning">Selling Fast!</span>}
      {soldOut && <span className="badge danger">Sold Out</span>}
      
      <div className="card-header">
        <h3>{tier.name}</h3>
        <p className="price">${(tier.price / 100).toFixed(2)}</p>
      </div>

      <div className="card-body">
        <div className="availability">
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(tier.available_seats / tier.total_capacity) * 100}%` }} 
            />
          </div>
          <span>{tier.available_seats} / {tier.total_capacity} seats left</span>
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
