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

import { unstable_cache, revalidateTag } from 'next/cache';

// Cache the token request for 23 hours (tokens usually last 24h)
// This works in serverless by using Next.js Data Cache
export const getAppAccessToken = unstable_cache(
    async (): Promise<string> => {
        try {
            console.log('[Kick Auth] Fetching new App Access Token...');
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
                cache: 'no-store' // Ensure we always fetch fresh if cache expired
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to get Kick app token: ${res.status} ${errorText}`);
            }

            const data = await res.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching Kick app token:', error);
            throw error;
        }
    },
    ['kick-app-token'],
    {
        revalidate: 60 * 60 * 23, // 23 hours
        tags: ['kick-auth']
    }
);

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
        console.warn('[Kick API] Token expired (401). Revalidating cache...');
        // Invalidate the cache tag to force a fresh token on next call
        // We can't easily retry *this* request without recursion or complexity,
        // but ensuring the next one works is a good start. 
        // In a real app, you might want a retry logic here.
        revalidateTag('kick-auth', 'default');
    }

    return res;
}
