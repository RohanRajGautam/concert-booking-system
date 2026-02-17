CREATE TABLE IF NOT EXISTS idempotency_keys (
  key           VARCHAR(512)  PRIMARY KEY,
  response_body JSONB         NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
