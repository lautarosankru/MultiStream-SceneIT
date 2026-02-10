import { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { KickChatMessage } from '@/types/kick';

// Common public key for Kick (ensure this is up to date or extract dynamically if needed)
const KICK_PUSHER_KEY = '32d8ec338341c29d6025';
const KICK_PUSHER_CLUSTER = 'us2';

export function useKickChat(channelSlug: string) {
    const [messages, setMessages] = useState<KickChatMessage[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const pusherRef = useRef<Pusher | null>(null);

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

                // 2. Connect to Pusher
                if (!pusherRef.current) {
                    pusherRef.current = new Pusher(KICK_PUSHER_KEY, {
                        cluster: KICK_PUSHER_CLUSTER,
                        wsHost: 'ws-us2.pusher.com', // Explicit host sometimes helps
                        wsPort: 80,
                        wssPort: 443,
                        forceTLS: true,
                        disableStats: true,
                        enabledTransports: ['ws', 'wss'],
                    });
                }

                const channelName = `chatrooms.${chatroomId}.v2`;
                const channel = pusherRef.current.subscribe(channelName);

                channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
                    if (mounted) {
                        // Transform if necessary, but usually data structure matches closely
                        const newMessage: KickChatMessage = {
                            id: data.id,
                            chatroom_id: data.chatroom_id,
                            content: data.content,
                            type: data.type,
                            created_at: data.created_at,
                            sender: data.sender
                        };
                        setMessages(prev => [...prev.slice(-199), newMessage]); // Keep last 200
                    }
                });

                setStatus('connected');

            } catch (err) {
                console.error("Kick Chat Error:", err);
                if (mounted) setStatus('error');
            }
        };

        connect();

        return () => {
            mounted = false;
            if (pusherRef.current) {
                pusherRef.current.disconnect();
                pusherRef.current = null;
            }
        };
    }, [channelSlug]);

    return { messages, status };
}
