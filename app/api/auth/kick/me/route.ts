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
        const response = await fetch(`${KICK_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch user' }, { status: response.status });
        }

        const data = await response.json();
        // Return the user data. Adjust structure if Kick returns { data: ... }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
