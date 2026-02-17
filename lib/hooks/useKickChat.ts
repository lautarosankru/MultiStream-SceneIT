import { useEffect, useState, useRef, useCallback } from 'react';
import { KickChatMessage } from '@/types/kick';
import { MAX_CHAT_MESSAGES, CHAT_RECONNECT_DELAY_MS, MAX_CHAT_RECONNECT_ATTEMPTS } from '@/lib/config/constants';

export function useKickChat(channelSlug: string) {
    const [messages, setMessages] = useState<KickChatMessage[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const eventSourceRef = useRef<EventSource | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                        return [...prev.slice(-(MAX_CHAT_MESSAGES - 1)), newMessage];
                    });
                } catch (error) {
                    console.error('[useKickChat] Error parsing SSE message:', error instanceof Error ? error.message : 'Unknown error');
                }
            };

            evtSource.onerror = () => {
                console.error('[useKickChat] SSE connection error');
                setStatus('error');
                
                // Attempt reconnection with exponential backoff
                if (reconnectAttemptsRef.current < MAX_CHAT_RECONNECT_ATTEMPTS) {
                    reconnectAttemptsRef.current++;
                    const delay = CHAT_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current - 1);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log(`[useKickChat] Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
                        connect();
                    }, delay);
                }
            };

        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('[useKickChat] Setup error:', error.message);
                setStatus('error');
            }
        }
    }, [channelSlug]);

    useEffect(() => {
        // Cleanup function
        const cleanup = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            reconnectAttemptsRef.current = 0;
            setMessages([]);
            setStatus('connecting');
        }

        if (channelSlug) {
            cleanup();
            connect();
        }

        return cleanup;
    }, [channelSlug, connect]);

    return { messages, status };
}

