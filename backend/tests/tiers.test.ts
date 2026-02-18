import request from 'supertest';
import { buildServer } from '../src/server';
import { pool } from '../src/db/pool';
import { runMigrations } from '../src/db/migrate';

const app = buildServer();

beforeAll(async () => {
  await runMigrations();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe('GET /api/tiers', () => {
  it('returns an array of tier objects', async () => {
    const res = await request(app.server).get('/api/tiers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
