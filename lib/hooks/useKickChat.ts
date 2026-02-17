import { useEffect, useState, useRef, useCallback } from 'react';
import { KickChatMessage } from '@/types/kick';

export function useKickChat(channelSlug: string) {
    const [messages, setMessages] = useState<KickChatMessage[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const eventSourceRef = useRef<EventSource | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const connect = useCallback(async () => {
        setStatus('connecting');
        
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
            // 1. Get Chatroom ID via our proxy
            const res = await fetch(`/api/kick/${channelSlug}`, {
                signal: abortControllerRef.current.signal
            });
            if (!res.ok) throw new Error('Failed to fetch channel data');
            if (abortControllerRef.current.signal.aborted) return;

            const data = await res.json();
            const chatroomId = data?.chatroom?.id;

            // Validate chatroomId is a valid number
            if (!chatroomId || typeof chatroomId !== 'number' || isNaN(chatroomId)) {
                throw new Error('Chatroom ID not found or invalid');
            }

            // 2. Connect to SSE
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const sseUrl = `/api/stream/sse/${chatroomId}`;

            const evtSource = new EventSource(sseUrl);
            eventSourceRef.current = evtSource;

            evtSource.onopen = () => {
                setStatus('connected');
            };

            evtSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    const newMessage: KickChatMessage = {
                        id: payload.id || crypto.randomUUID(),
                        chatroom_id: payload.chatroom_id,
                        content: payload.content,
                        type: payload.type || 'message',
                        created_at: payload.created_at || new Date().toISOString(),
                        sender: payload.sender || { username: 'Unknown', slug: 'unknown' }
                    };

                    setMessages(prev => {
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev.slice(-199), newMessage];
                    });
                } catch (e) {
                    console.error("Error parsing SSE message", e);
                }
            };

            evtSource.onerror = (err) => {
                console.error("SSE Error:", err);
                setStatus('error');
            };

        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error("Kick Chat Setup Error:", err);
                setStatus('error');
            }
        }
    }, [channelSlug]);

    useEffect(() => {
        // Cleanup function
        const cleanup = () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
                abortControllerRef.current = null
            }
            setMessages([])
            setStatus('connecting')
        }

        if (channelSlug) {
            cleanup()
            connect()
        }

        return cleanup
    }, [channelSlug]);

    return { messages, status };
}

