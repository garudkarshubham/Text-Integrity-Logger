import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { User, Role } from '@prisma/client';

const SESSION_COOKIE_NAME = 'user_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'default-insecure-secret-change-me';

// --- Password Hashing ---

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hashedPassword}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const hashedPassword = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return timingSafeEqual(hashedPassword, keyBuffer);
}

// --- Session Management (Simple JSON cookie with HMAC signature) ---

interface SessionData {
    userId: string;
    role: Role;
    email: string;
    expiresAt: number;
}

function sign(data: string): string {
    return createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
}

function verify(data: string, signature: string): boolean {
    const expected = sign(data);
    return expected === signature;
}

export async function createSession(user: User) {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const sessionData: SessionData = {
        userId: user.id,
        role: user.role,
        email: user.email,
        expiresAt
    };

    const dataStr = JSON.stringify(sessionData);
    const signature = sign(dataStr);
    const cookieValue = `${Buffer.from(dataStr).toString('base64url')}.${signature}`;

    (await cookies()).set(SESSION_COOKIE_NAME, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });
}

export async function clearSession() {
    (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function decryptSession(): Promise<SessionData | null> {
    const cookieToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!cookieToken) return null;

    const [dataB64, signature] = cookieToken.split('.');
    if (!dataB64 || !signature) return null;

    const dataStr = Buffer.from(dataB64, 'base64url').toString('utf-8');

    if (!verify(dataStr, signature)) return null;

    try {
        const session: SessionData = JSON.parse(dataStr);
        if (Date.now() > session.expiresAt) return null;
        return session;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<SessionData | null> {
    return decryptSession();
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user;
}
