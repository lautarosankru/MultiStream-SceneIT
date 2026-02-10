import { NextRequest, NextResponse } from 'next/server';
import { KICK_TOKEN_URL, KICK_CLIENT_ID, KICK_CLIENT_SECRET, REDIRECT_URI, KICK_API_URL } from '@/lib/kick-auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/?error=${error}`, req.url));
    }

    if (!code || !state) {
        return NextResponse.redirect(new URL('/?error=missing_code_or_state', req.url));
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get('kick_auth_state')?.value;
    const codeVerifier = cookieStore.get('kick_code_verifier')?.value;

    if (!savedState || !codeVerifier || savedState !== state) {
        return NextResponse.redirect(new URL('/?error=invalid_state', req.url));
    }

    try {
        // 1. Exchange Code for Token
        const tokenResponse = await fetch(KICK_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: KICK_CLIENT_ID,
                client_secret: KICK_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error("Token Exchange Error:", errText);
            return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.url));
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;

        // 2. Fetch User Info using the access token
        const userResponse = await fetch(`${KICK_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!userResponse.ok) {
            console.error("User User Fetch Error:", await userResponse.text());
            return NextResponse.redirect(new URL('/?error=user_fetch_failed', req.url));
        }

        const userDataWrapper = await userResponse.json();
        // Assuming /users returns { data: [ { id, username, ... } ] } or similar. Kick API varies.
        // Actually standard /users/me or just /users usually returns the authenticated user if no ID param.
        // Let's debug this response if needed. Standard OAuth usually provides an endpoint.
        // If /users is not 'me', we might need to find the right endpoint.
        // Kick Docs say: GET https://api.kick.com/public/v1/users to list? No.
        // Usually it's /users/me or check the token scopes.
        // Let's assume passed strictly. For now, we'll pass the token to the client (securely? no, via internal API or cookie).

        // BETTER APPROACH: Set an HTTP-only session cookie with the access token. 
        // Then the client can query a local /api/me endpoint to get data.
        // OR: Just set a client-readable cookie with basic user info for display, and keep token httpOnly.

        cookieStore.set('kick_access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
        if (refreshToken) {
            cookieStore.set('kick_refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
        }

        // Clean up temp cookies
        cookieStore.delete('kick_code_verifier');
        cookieStore.delete('kick_auth_state');

        return NextResponse.redirect(new URL('/?success=kick_connected', req.url));

    } catch (e) {
        console.error("Auth Exception:", e);
        return NextResponse.redirect(new URL('/?error=exception', req.url));
    }
}
