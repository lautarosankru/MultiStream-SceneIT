import { useRef, useEffect } from 'react';
import { useKickChat } from '@/lib/hooks/useKickChat';
import { StreamItem } from '@/types/scene';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

interface KickNativeChatProps {
    item: StreamItem;
}

export function KickNativeChat({ item }: KickNativeChatProps) {
    const { messages, status } = useKickChat(item.sourceId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (status === 'connecting') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Conectando a {item.sourceId}...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-4 text-center">
                <AlertCircle className="h-6 w-6" />
                <span className="text-xs">Error conectando al chat. Verifica el nombre del canal.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0E0E10] text-sm overflow-hidden">
            <ScrollArea className="flex-1 p-2">
                <div className="flex flex-col gap-1 pb-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className="leading-snug break-words hover:bg-white/5 py-0.5 px-1 rounded transition-colors group">
                            {/* Timestamp (Optional, maybe on hover) */}
                            {/* <span className="text-[10px] text-slate-500 mr-1 opacity-0 group-hover:opacity-100 inline-block w-8">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                            </span> */}

                            <span
                                className="font-bold mr-1.5"
                                style={{ color: msg.sender.identity.color || '#53FC18' }}
                            >
                                {msg.sender.username}:
                            </span>
                            <span className="text-slate-200">
                                {msg.content}
                            </span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Input Placeholder (Read Only for now) */}
            <div className="p-3 border-t border-white/5 bg-black/20">
                <div className="bg-white/5 rounded px-3 py-2 text-xs text-slate-500 text-center select-none cursor-not-allowed">
                    Modo Lectura (Login próximamente)
                </div>
            </div>
        </div>
    );
}
