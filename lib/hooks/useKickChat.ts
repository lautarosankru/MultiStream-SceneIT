import { useEffect, useState, useRef } from 'react';
import { KickChatMessage } from '@/types/kick';

export function useKickChat(channelSlug: string) {
    const [messages, setMessages] = useState<KickChatMessage[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let mounted = true;

        const connect = async () => {
            try {
                // 1. Get Chatroom ID via our proxy
                const res = await fetch(`/api/kick/${channelSlug}`);
                if (!res.ok) throw new Error('Failed to fetch channel data');

                const data = await res.json();
                const chatroomId = data?.chatroom?.id;

                if (!chatroomId) throw new Error('Chatroom ID not found');

                // 2. Connect to SSE
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }

                const sseUrl = `/api/stream/sse/${chatroomId}`;
                console.log(`Connecting to SSE: ${sseUrl}`);

                const evtSource = new EventSource(sseUrl);
                eventSourceRef.current = evtSource;

                evtSource.onopen = () => {
                    if (mounted) setStatus('connected');
                    console.log("SSE Connected");
                };

                evtSource.onmessage = (event) => {
                    if (!mounted) return;
                    try {
                        const payload = JSON.parse(event.data);
                        // Kick payload structure might vary slightly, but generally 'content', 'sender', etc.
                        // We map it to our type if needed.
                        const newMessage: KickChatMessage = {
                            id: payload.id || crypto.randomUUID(),
                            chatroom_id: payload.chatroom_id,
                            content: payload.content,
                            type: payload.type || 'message',
                            created_at: payload.created_at || new Date().toISOString(),
                            sender: payload.sender || { username: 'Unknown', slug: 'unknown' }
                        };

                        setMessages(prev => {
                            // Deduplicate based on ID if possible
                            if (prev.some(m => m.id === newMessage.id)) return prev;
                            return [...prev.slice(-199), newMessage];
                        });
                    } catch (e) {
                        console.error("Error parsing SSE message", e);
                    }
                };

                evtSource.onerror = (err) => {
                    console.error("SSE Error:", err);
                    if (mounted) setStatus('error');
                    // EventSource auto-reconnects, but we might want to manually retry if it fails hard
                };

            } catch (err) {
                console.error("Kick Chat Setup Error:", err);
                if (mounted) setStatus('error');
            }
        };

        if (channelSlug) {
            connect();
        }

        return () => {
            mounted = false;
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [channelSlug]);

    return { messages, status };
}

