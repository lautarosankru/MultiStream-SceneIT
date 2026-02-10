"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { ChatEmbed } from "./embeds/ChatEmbed"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, X, RefreshCw, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

export function ChatSidebar() {
    const {
        items,
        activeChatId,
        setActiveChat,
        isSidebarOpen,
        toggleSidebar
    } = useSceneStore()

    // Force reload of active chat logic
    const [reloadKey, setReloadKey] = useState(0)

    const handleReload = () => {
        setReloadKey(prev => prev + 1)
    }

    // Auto-select first chat if none selected and items exist
    useEffect(() => {
        if (!activeChatId && items.length > 0) {
            setActiveChat(items[0].id)
        }
    }, [items, activeChatId, setActiveChat])

    if (!isSidebarOpen) return <div className="hidden" />

    const activeItem = items.find(i => i.id === activeChatId)

    return (
        <div className="w-96 h-screen bg-[#0E0E10] border-l border-white/5 flex flex-col shrink-0 transition-all duration-300">
            {/* Tabs Header */}
            <div className="h-10 flex items-center px-1 gap-1 bg-black/40 border-b border-white/5">
                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar mask-linear">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveChat(item.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all relative group shrink-0",
                                activeChatId === item.id
                                    ? "text-white"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {/* Active Indicator */}
                            {activeChatId === item.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full" />
                            )}

                            {/* Platform Icon Dot */}
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                item.platform === 'twitch' ? 'bg-[#9146FF]' :
                                    item.platform === 'kick' ? 'bg-[#53FC18]' :
                                        item.platform === 'youtube' ? 'bg-[#FF0000]' : 'bg-gray-500'
                            )} />
                            <span className="truncate max-w-[80px]">{item.sourceId}</span>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center pl-1 border-l border-white/5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5"
                        onClick={handleReload}
                        title="Recargar Chat"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 bg-[#0E0E10] relative overflow-hidden">
                {activeItem ? (
                    <div className="w-full h-full" key={`${activeItem.id}-${reloadKey}`}>
                        <ChatEmbed item={activeItem} />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-6 text-center select-none">
                        <MessageSquare className="h-12 w-12 mb-3 opacity-10" />
                        <p className="text-sm">Selecciona un chat</p>
                    </div>
                )}
            </div>
        </div>
    )
}
