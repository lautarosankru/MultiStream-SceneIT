import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        
        // Clear all Kick auth cookies
        cookieStore.delete('kick_access_token');
        cookieStore.delete('kick_refresh_token');
        cookieStore.delete('kick_code_verifier');
        cookieStore.delete('kick_auth_state');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
