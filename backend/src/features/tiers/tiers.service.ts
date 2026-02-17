import { pool } from '../../db/pool';
import { Tier } from '../../types';
import { fetchAllTiers } from './tiers.queries';

export async function listTiers(): Promise<Tier[]> {
  return fetchAllTiers(pool);
}
