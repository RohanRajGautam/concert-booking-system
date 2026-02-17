CREATE TABLE IF NOT EXISTS bookings (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id         UUID         NOT NULL REFERENCES tiers(id),
  user_id         UUID         NOT NULL,
  quantity        INTEGER      NOT NULL CHECK (quantity > 0),
  total_amount    INTEGER      NOT NULL CHECK (total_amount >= 0),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tier_id ON bookings (tier_id);
