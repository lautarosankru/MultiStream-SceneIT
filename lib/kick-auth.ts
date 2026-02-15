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

// --- Server-Side Only Helpers ---

let appAccessToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAppAccessToken(): Promise<string> {
    // Return cached token if valid
    if (appAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return appAccessToken;
    }

    try {
        const res = await fetch(KICK_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: KICK_CLIENT_ID,
                client_secret: KICK_CLIENT_SECRET,

            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to get Kick app token: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        appAccessToken = data.access_token;
        // Expires in is usually in seconds. Subtract a buffer (e.g. 60s) just in case.
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

        return appAccessToken!;
    } catch (error) {
        console.error('Error fetching Kick app token:', error);
        throw error;
    }
}

export async function fetchKickAPI(endpoint: string, options: RequestInit = {}) {
    const token = await getAppAccessToken();

    const url = endpoint.startsWith('http') ? endpoint : `${KICK_API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
    });

    if (res.status === 401) {
        // Token might have expired unexpectedly, retry once could be implemented here
        // For now, just invalidate cache so next request tries to get a new one
        appAccessToken = null;
        tokenExpiry = null;
    }

    return res;
}
