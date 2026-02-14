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
        // Note: The Kick API /users/me endpoint may not exist or requires specific setup.
        // For now, we just store the token and proceed. The frontend can use the token
        // to make authenticated requests or we can query user data on demand.
        // Let's try a simplified approach - just store the token for now.
        
        // Attempt to get user info, but don't fail if it doesn't work
        let userData = null;
        try {
            const userResponse = await fetch(`${KICK_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (userResponse.ok) {
                userData = await userResponse.json();
            }
        } catch (e) {
            console.log("Could not fetch user info, storing token anyway");
        }

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
