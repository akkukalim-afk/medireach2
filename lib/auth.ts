import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'medireach_jwt_super_secret_session_key_2026_secure';
const key = new TextEncoder().encode(SECRET_KEY);

export type Role = 'CUSTOMER' | 'PHARMACY_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  pharmacyId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('medireach_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

