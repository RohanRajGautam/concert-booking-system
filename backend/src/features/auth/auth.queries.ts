import { Pool } from 'pg';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function findUserByEmail(
  db: Pool,
  email: string,
): Promise<UserRow | null> {
  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(
  db: Pool,
  id: string,
): Promise<UserRow | null> {
  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function insertUser(
  db: Pool,
  username: string,
  email: string,
  passwordHash: string,
): Promise<UserRow> {
  const { rows } = await db.query<UserRow>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, passwordHash],
  );
  return rows[0];
}
