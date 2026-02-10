import { createHash, randomBytes } from 'crypto';

export const KICK_AUTH_URL = 'https://id.kick.com/oauth/authorize';
export const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
export const KICK_API_URL = 'https://api.kick.com/public/v1';

export const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID!;
export const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET!;
// Default to localhost if not set, for safety. User needs to set NEXT_PUBLIC_APP_URL for prod.
export const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/kick/callback`
    : 'http://localhost:3000/api/auth/kick/callback';

export const KICK_SCOPES = [
    'user:read',
    'stream:read',
    'chat:write', // Required for sending messages if we implement that
    'channel:read'
].join(' ');

// Generate a random string for the code verifier
export function generateCodeVerifier(length: number = 128): string {
    return base64URLEncode(randomBytes(32));
}

// Generate the code challenge from the identifier
export function generateCodeChallenge(verifier: string): string {
    return base64URLEncode(createHash('sha256').update(verifier).digest());
}

function base64URLEncode(str: Buffer): string {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
