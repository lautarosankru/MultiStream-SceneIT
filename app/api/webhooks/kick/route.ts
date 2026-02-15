import { NextRequest, NextResponse } from 'next/server';
import { streamEmitter, EVENTS } from '@/lib/kick-stream-emitter';

// Webhook Receiver for Production
// Kick sends POST requests here.

export async function POST(req: NextRequest) {
    try {
        // Parse Body
        const body = await req.json();

        // Log for debugging on VPS (checks logs via `pm2 logs` or vercel logs)
        console.log("Kick Webhook Received:", JSON.stringify(body).substring(0, 200));

        // Validate Event Type
        const eventType = body.subscription?.type || body.event; // Kick structure might vary slightly, safer to check both or log

        // According to docs, the payload for `chat.message.sent` usually has `event` or wrapped inside subscription
        // Let's assume standard structure:
        // { "event": "chat.message.sent", "data": { ... }, "channel_id": ... }

        if (eventType === 'chat.message.sent') {
            const eventData = body.event || body.data; // The actual message object
            const chatroomId = eventData.chatroom_id;

            if (chatroomId) {
                console.log(`Broadcasting chat message to chatroom_${chatroomId}`);
                streamEmitter.emit(EVENTS.CHAT_MESSAGE, {
                    channel: `chatroom_${chatroomId}`,
                    data: eventData
                });
            } else {
                console.warn("Webhook received without chatroom_id in data");
            }
        }

        return NextResponse.json({ status: 'received' });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
