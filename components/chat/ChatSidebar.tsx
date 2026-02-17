"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { useResizable } from "@/lib/hooks/useResizable"
import { ChatEmbed } from "./embeds/ChatEmbed"
import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { MessageSquare, RefreshCw, ChevronDown, Check } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"

const MIN_SIDEBAR_WIDTH = 280
const MAX_SIDEBAR_WIDTH = 800

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
    twitch: { bg: 'bg-[#9146FF]', text: 'text-[#9146FF]' },
    kick: { bg: 'bg-[#53FC18]', text: 'text-[#53FC18]' },
    youtube: { bg: 'bg-[#FF0000]', text: 'text-[#FF0000]' },
}

function ChatSelector({
    items,
    activeChatId,
    onSelect,
    onReload,
}: {
    items: Array<{ id: string; sourceId: string; platform: string }>
    activeChatId: string | null
    onSelect: (id: string) => void
    onReload: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)

    const activeItem = useMemo(
        () => items.find(i => i.id === activeChatId),
        [items, activeChatId]
    )

    const handleSelect = useCallback((id: string) => {
        onSelect(id)
        setIsOpen(false)
    }, [onSelect])

    const platformStyle = activeItem ? PLATFORM_COLORS[activeItem.platform] : null

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all relative group rounded-lg border border-transparent",
                        "bg-white/60 dark:bg-white/10 text-slate-800 dark:text-slate-100",
                        "hover:bg-white/80 dark:hover:bg-white/20",
                        "ring-1 ring-white/60 dark:ring-white/10",
                        "focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    )}
                >
                    {activeItem ? (
                        <>
                            {platformStyle && (
                                <span className={cn(
                                    "w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]",
                                    platformStyle.bg,
                                    platformStyle.text
                                )} />
                            )}
                            <span className="truncate max-w-[100px]">{activeItem.sourceId}</span>
                            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 ml-1" />
                        </>
                    ) : (
                        <>
                            <MessageSquare className="h-4 w-4" />
                            <span>Seleccionar chat</span>
                            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 ml-1" />
                        </>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={8}
                className="w-64 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-xl"
            >
                <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                    {items.map((item) => {
                        const isActive = item.id === activeChatId
                        const pStyle = PLATFORM_COLORS[item.platform]

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg text-left",
                                    isActive
                                        ? "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-100"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                                )}
                            >
                                {pStyle && (
                                    <span className={cn(
                                        "w-2.5 h-2.5 rounded-full shrink-0",
                                        pStyle.bg
                                    )} />
                                )}
                                <span className="flex-1 truncate">{item.sourceId}</span>
                                {isActive && (
                                    <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                    <button
                        onClick={() => {
                            onReload()
                            setIsOpen(false)
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Recargar chat</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function ChatSidebar() {
    const {
        items,
        activeChatId,
        setActiveChat,
        isSidebarOpen,
        chatSidebarWidth,
        setChatSidebarWidth
    } = useSceneStore()

    // ✅ Nuevo hook personalizado para resize
    const { width, isDragging, resizeHandleProps } = useResizable({
        initialWidth: chatSidebarWidth,
        minWidth: MIN_SIDEBAR_WIDTH,
        maxWidth: (viewportWidth) => Math.min(MAX_SIDEBAR_WIDTH, viewportWidth * 0.5),
        edge: 'left', // Sidebar está a la derecha, resize desde el borde izquierdo
        onResize: setChatSidebarWidth,
    })

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
    }, [items.length, activeChatId, setActiveChat])

    const activeItem = useMemo(
        () => items.find(i => i.id === activeChatId),
        [items, activeChatId]
    )

    const chatItems = useMemo(
        () => items.map(item => ({
            id: item.id,
            sourceId: item.sourceId,
            platform: item.platform
        })),
        [items]
    )

    if (!isSidebarOpen) return <div className="hidden" />

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "h-full flex flex-col shrink-0 transition-all duration-300",
                "glass-sidebar border-l border-white/20 dark:border-white/5 shadow-2xl z-50 relative",
                isDragging && "ring-2 ring-cyan-400/50" // ✅ Feedback visual durante drag
            )}
            style={{ width }}
        >
            {/* ✅ Resize Handle - Touch-friendly */}
            <div {...resizeHandleProps} />

            {/* Glossy Header */}
            <div className="h-14 flex items-center px-3 gap-3 bg-white/60 to-white/30 dark:bg-black/90 border-b border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm">
                <ChatSelector
                    items={chatItems}
                    activeChatId={activeChatId}
                    onSelect={setActiveChat}
                    onReload={handleReload}
                />
            </div>

            {/* Chat Content */}
            <div className="flex-1 bg-black/10 dark:bg-black/80 relative overflow-hidden backdrop-blur-sm">
                {activeItem ? (
                    <div className="w-full h-full" key={`${activeItem.id}-${reloadKey}`}>
                        <ChatEmbed item={activeItem} />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 p-6 text-center select-none">
                        <div className="relative">
                            <MessageSquare className="h-16 w-16 mb-3 opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-lime-400/20 blur-xl rounded-full" />
                        </div>
                        <p className="text-sm font-medium drop-shadow-md">Selecciona un chat para comenzar</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
