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

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            const send = (data: string) => {
                controller.enqueue(encoder.encode(data));
            };

            send(`retry: 5000\n\n`);
            send(`: welcome to kick chat for channel ${channel}\n\n`);

            const onMessage = (payload: ChatMessagePayload) => {
                if (payload.channel === `chatroom_${channel}`) {
                    const dataString = JSON.stringify(payload.data);
                    send(`data: ${dataString}\n\n`);
                }
            };

            streamEmitter.on(EVENTS.CHAT_MESSAGE, onMessage);

            req.signal.addEventListener('abort', () => {
                streamEmitter.off(EVENTS.CHAT_MESSAGE, onMessage);
                controller.close();
            });

            const interval = setInterval(() => {
                send(`: heartbeat\n\n`);
            }, 15000);

            req.signal.addEventListener('abort', () => {
                clearInterval(interval);
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
