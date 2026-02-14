import { NextRequest, NextResponse } from 'next/server';
import { KICK_API_URL } from '@/lib/kick-auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kick_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Note: Kick API /users/me endpoint may not be available. 
        // We return what we can - if it fails, the frontend can handle it.
        let userData = null;
        try {
            const response = await fetch(`${KICK_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                userData = await response.json();
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
        }
        
        return NextResponse.json(userData || { error: 'Could not fetch user data' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
