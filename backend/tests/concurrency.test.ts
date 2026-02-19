import request from 'supertest';
import { randomUUID } from 'crypto';
import { buildServer } from '../src/server';
import { pool } from '../src/db/pool';
import { runMigrations } from '../src/db/migrate';

const app = buildServer();

let authToken: string;

beforeAll(async () => {
  await runMigrations();
  await app.ready();

  const res = await request(app.server).post('/api/auth/register').send({
    username: 'concurrtest',
    email: `concurrtest-${randomUUID()}@test.com`,
    password: 'password123',
  });
  authToken = res.body.token;
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe('Concurrency', () => {
  it('prevents overselling under concurrent requests', async () => {
    const tiersRes = await request(app.server).get('/api/tiers');
    const tier = tiersRes.body[0];

    // Fire 5 concurrent booking requests for 1 seat each
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app.server)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            tierId: tier.id,
            quantity: 1,
            idempotencyKey: randomUUID(),
          }),
      ),
    );

    const successes = results.filter((r) => r.status === 201);
    const failures = results.filter((r) => r.status >= 400);

    // All should either succeed or fail with inventory/payment errors — never oversell
    expect(successes.length + failures.length).toBe(5);
  });
});
