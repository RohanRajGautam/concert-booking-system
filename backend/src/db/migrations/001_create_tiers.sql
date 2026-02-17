CREATE TABLE IF NOT EXISTS tiers (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL UNIQUE,
  price           INTEGER      NOT NULL CHECK (price > 0),
  total_capacity  INTEGER      NOT NULL CHECK (total_capacity > 0),
  available_seats INTEGER      NOT NULL CHECK (available_seats >= 0),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO tiers (name, price, total_capacity, available_seats) VALUES
  ('VIP',               10000,   50,   50),
  ('Front Row',          5000,  200,  200),
  ('General Admission',  1000, 1000, 1000)
ON CONFLICT (name) DO NOTHING;
