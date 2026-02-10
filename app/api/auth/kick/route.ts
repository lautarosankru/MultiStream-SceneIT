import { NextRequest, NextResponse } from 'next/server';
import { generateCodeChallenge, generateCodeVerifier, KICK_AUTH_URL, KICK_CLIENT_ID, KICK_SCOPES, REDIRECT_URI } from '@/lib/kick-auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    // 1. Generate PKCE Verifier & Challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // 2. State for CSRF protection
    const state = generateCodeVerifier(32);

    // 3. Store verifier and state in HttpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set('kick_code_verifier', codeVerifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    cookieStore.set('kick_auth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    // 4. Build Authorization URL
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: KICK_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: KICK_SCOPES,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
    });

    return NextResponse.redirect(`${KICK_AUTH_URL}?${params.toString()}`);
}
