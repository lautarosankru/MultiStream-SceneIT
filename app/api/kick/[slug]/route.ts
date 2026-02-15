import { NextResponse } from 'next/server'
import { fetchKickAPI } from '@/lib/kick-auth'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug

    if (!slug) {
        return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    try {
        // 1. Fetch from Official V1 API (Authenticated)
        // Note: usage of '/public/v1/channels?slug=' based on testing
        const v1Res = await fetchKickAPI(`/public/v1/channels?slug=${slug}`, {
            next: { revalidate: 3600 }
        })

        let v1Data = null;
        if (v1Res.ok) {
            const json = await v1Res.json();
            if (json.data && json.data.length > 0) {
                v1Data = json.data[0];
            }
        }

        if (!v1Data) {
            console.error(`Kick V1 API failed or channel not found for slug: ${slug}`);
            // Fallback: If V1 fails, we might check if it's a 404 or try V2 completely?
            // For now, let's treat V1 as authority for existence.
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
        }

        // 2. Fetch from Internal V2 API (For Chatroom ID)
        // The V1 API currently does not expose the chatroom/channel ID required for Pusher.
        // We use V2 purely to augment this missing field.
        let chatroom = null;
        try {
            const v2Res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
                next: { revalidate: 3600 }
            });
            if (v2Res.ok) {
                const v2Data = await v2Res.json();
                chatroom = v2Data.chatroom;
            }
        } catch (error) {
            console.warn('Failed to fetch V2 data for chatroom ID', error);
        }

        // 3. Merge and Return
        // Frontend expects: { chatroom: { id: ... }, ... }
        // We also want to map V1 fields to what frontend might use if it differs, 
        // but looking at useKickChat, it primarily needs `chatroom.id`.

        const responseData = {
            ...v1Data,
            chatroom: chatroom
        };

        return NextResponse.json(responseData)

    } catch (error) {
        console.error('Kick proxy error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
