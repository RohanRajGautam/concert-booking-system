import request from 'supertest';
import { randomUUID } from 'crypto';
import { buildServer } from '../src/server';
import { pool } from '../src/db/pool';
import { runMigrations } from '../src/db/migrate';

const app = buildServer();

let authToken: string;
let testUserId: string;

beforeAll(async () => {
  await runMigrations();
  await app.ready();

  // Register a test user to get a valid JWT
  const res = await request(app.server).post('/api/auth/register').send({
    username: 'booktest',
    email: `booktest-${randomUUID()}@test.com`,
    password: 'password123',
  });
  authToken = res.body.token;
  testUserId = res.body.user.id;
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe('POST /api/bookings', () => {
  it('creates a booking successfully', async () => {
    const tiersRes = await request(app.server).get('/api/tiers');
    const tierId = tiersRes.body[0].id;
    const res = await request(app.server)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tierId,
        quantity: 1,
        idempotencyKey: randomUUID(),
      });
    expect(res.status).toBe(201);
  });

  it('returns 401 without a token', async () => {
    const tiersRes = await request(app.server).get('/api/tiers');
    const tierId = tiersRes.body[0].id;
    const res = await request(app.server)
      .post('/api/bookings')
      .send({
        tierId,
        quantity: 1,
        idempotencyKey: randomUUID(),
      });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/bookings/:userId', () => {
  it('returns bookings for the authenticated user', async () => {
    const res = await request(app.server)
      .get(`/api/bookings/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app.server).get(`/api/bookings/${testUserId}`);
    expect(res.status).toBe(401);
  });
});
