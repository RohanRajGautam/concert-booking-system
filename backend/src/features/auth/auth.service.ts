import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/pool';
import { config } from '../../config';
import { AppError } from '../../middleware/errorHandler';
import { findUserByEmail, insertUser } from './auth.queries';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    config.jwtSecret,
    { expiresIn: TOKEN_EXPIRY },
  );
}

function toAuthUser(row: { id: string; username: string; email: string }): AuthUser {
  return { id: row.id, username: row.username, email: row.email };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existing = await findUserByEmail(pool, email);
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const row = await insertUser(pool, username, email, passwordHash);
  const user = toAuthUser(row);
  return { user, token: signToken(user) };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const row = await findUserByEmail(pool, email);
  if (!row) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const user = toAuthUser(row);
  return { user, token: signToken(user) };
}
