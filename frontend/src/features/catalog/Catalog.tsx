import React from 'react';
import { useTiers } from '../../hooks/useTiers';
import { TierCard } from './TierCard';
import type { Tier } from '../../types';

interface CatalogProps {
  onSelectTier: (tier: Tier) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onSelectTier }) => {
  const { data: tiers, isLoading, isError } = useTiers();

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
          <TierCard key={tier.id} tier={tier} onSelect={onSelectTier} />
        ))}
      </div>
    </div>
  );
};
