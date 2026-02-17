import { NextRequest } from 'next/server';
import { streamEmitter, EVENTS } from '@/lib/kick-stream-emitter';

interface ChatMessagePayload {
    channel: string;
    data: Record<string, unknown>;
}

// SSE Endpoint for Production
// This will run on the VPS. 
// Clients connect here to receive chat messages that the VPS receives via Webhooks.

export async function GET(req: NextRequest, { params }: { params: Promise<{ channel: string }> }) {
    const channel = (await params).channel;

    // Create a TransformStream for the SSE response
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // 1. Send initial retry configuration and comment to keep connection alive
    // Retry every 5 seconds if disconnected
    writer.write(encoder.encode(`retry: 5000\n\n`));
    writer.write(encoder.encode(`: welcome to kick chat for channel ${channel}\n\n`));

    // 2. Define the message handler
    const onMessage = (payload: ChatMessagePayload) => {
        // payload: { channel: 'chatroom_123', data: { ... } }
        // We match by the channel ID (chatroom_id) passed in the URL path
        if (payload.channel === `chatroom_${channel}`) {
            const dataString = JSON.stringify(payload.data);
            // SSE format: data: {json}\n\n
            writer.write(encoder.encode(`data: ${dataString}\n\n`));
        }
    };

    // 3. Subscribe to the global emitter
    // Note: In a multi-instance production env (like Vercel serverless), this singleton pattern fails.
    // But for a VPS running a single Next.js instance via `next start`, this works perfectly.
    streamEmitter.on(EVENTS.CHAT_MESSAGE, onMessage);

    // 4. Handle Disconnects
    // Clean up the listener when the client disconnects or the request is aborted.
    req.signal.addEventListener('abort', () => {
        streamEmitter.off(EVENTS.CHAT_MESSAGE, onMessage);
        writer.close().catch(() => { }); // suppress error on close
    });

    // 5. Keep-Alive / Heartbeat (Optional but recommended for robust connections)
    // Send a comment every 15 seconds to prevent timeout
    const interval = setInterval(() => {
        writer.write(encoder.encode(`: heartbeat\n\n`)).catch(() => {
            clearInterval(interval);
            streamEmitter.off(EVENTS.CHAT_MESSAGE, onMessage);
        });
    }, 15000);

    // Clean up interval on abort too
    req.signal.addEventListener('abort', () => {
        clearInterval(interval);
    });

    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            // CORS headers might be needed if frontend is on different domain, 
            // but here it's same domain (sceneit.online)
        },
    });
}
