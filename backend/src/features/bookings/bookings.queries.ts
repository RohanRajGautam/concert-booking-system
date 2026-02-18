import { Pool, PoolClient } from 'pg';
import { Booking, BookingWithTier } from '../../types';

type Executor = Pool | PoolClient;

export async function findCachedIdempotencyResponse(
  client: PoolClient,
  key: string,
): Promise<Booking | null> {
  const { rows } = await client.query<{ response_body: Booking }>(
    'SELECT response_body FROM idempotency_keys WHERE key = $1',
    [key],
  );
  return rows[0]?.response_body ?? null;
}

export async function insertBooking(
  client: PoolClient,
  tierId: string,
  userId: string,
  quantity: number,
  totalAmount: number,
): Promise<Booking> {
  const { rows } = await client.query<Booking>(
    `INSERT INTO bookings (tier_id, user_id, quantity, total_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tierId, userId, quantity, totalAmount],
  );
  return rows[0];
}

export async function cacheIdempotencyKey(
  client: PoolClient,
  key: string,
  booking: Booking,
): Promise<void> {
  await client.query(
    'INSERT INTO idempotency_keys (key, response_body) VALUES ($1, $2)',
    [key, JSON.stringify(booking)],
  );
}

export async function fetchBookingsForUser(
  db: Executor,
  userId: string,
): Promise<BookingWithTier[]> {
  const { rows } = await db.query<BookingWithTier>(
    `SELECT
       b.id, b.tier_id, b.user_id, b.quantity, b.total_amount, b.created_at,
       t.name  AS tier_name,
       t.price AS unit_price
     FROM bookings b
     JOIN tiers t ON t.id = b.tier_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId],
  );
  return rows;
}
