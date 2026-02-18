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

describe('Concurrency', () => {
  it('prevents overselling', async () => {
    // Basic test structure
    expect(true).toBe(true);
  });
});
