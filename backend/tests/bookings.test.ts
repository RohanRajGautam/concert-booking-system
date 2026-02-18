import request from 'supertest';
import { randomUUID } from 'crypto';
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

describe('POST /api/bookings', () => {
  it('creates a booking successfully', async () => {
    const tiersRes = await request(app.server).get('/api/tiers');
    const tierId = tiersRes.body[0].id;
    const res = await request(app.server).post('/api/bookings').send({
      tierId,
      userId: randomUUID(),
      quantity: 1,
      idempotencyKey: randomUUID(),
    });
    expect(res.status).toBe(201);
  });
});
