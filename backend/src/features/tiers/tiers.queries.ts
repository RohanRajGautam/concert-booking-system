import { Pool, PoolClient } from 'pg';
import { Tier } from '../../types';

type Executor = Pool | PoolClient;

export async function fetchAllTiers(db: Executor): Promise<Tier[]> {
  const { rows } = await db.query<Tier>(
    'SELECT * FROM tiers ORDER BY price DESC',
  );
  return rows;
}

export async function fetchTierByIdForUpdate(
  client: PoolClient,
  tierId: string,
): Promise<Tier | null> {
  const { rows } = await client.query<Tier>(
    'SELECT * FROM tiers WHERE id = $1 FOR UPDATE',
    [tierId],
  );
  return rows[0] ?? null;
}

export async function decrementAvailableSeats(
  client: PoolClient,
  tierId: string,
  quantity: number,
): Promise<void> {
  await client.query(
    `UPDATE tiers
     SET available_seats = available_seats - $1,
         updated_at = NOW()
     WHERE id = $2`,
    [quantity, tierId],
  );
}
