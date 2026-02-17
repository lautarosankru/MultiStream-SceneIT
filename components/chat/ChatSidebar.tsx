"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { useResizable } from "@/lib/hooks/useResizable"
import { ChatEmbed } from "./embeds/ChatEmbed"
import { ChatSelector } from "./ChatSelector"
import { cn } from "@/lib/utils"
import { MessageSquare } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from "@/lib/constants"

export function ChatSidebar() {
    const {
        items,
        activeChatId,
        setActiveChat,
        isSidebarOpen,
        chatSidebarWidth,
        setChatSidebarWidth
    } = useSceneStore()

    // Resize hook
    const { width, isDragging, resizeHandleProps } = useResizable({
        initialWidth: chatSidebarWidth,
        minWidth: MIN_SIDEBAR_WIDTH,
        maxWidth: (viewportWidth) => Math.min(MAX_SIDEBAR_WIDTH, viewportWidth * 0.5),
        edge: 'left',
        onResize: setChatSidebarWidth,
    })

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Force reload of active chat logic
    const [reloadKey, setReloadKey] = useState(0)

    const handleReload = () => {
        setReloadKey(prev => prev + 1)
    }

    // Memoize derived data
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

    // Auto-select first chat if none selected and items exist
    useEffect(() => {
        if (!activeChatId && items.length > 0) {
            setActiveChat(items[0].id)
        }
    }, [items, activeChatId, setActiveChat])

    // Disable resize on mobile
    if (!isSidebarOpen) return <div className="hidden" />

    // Desktop: Resizable Sidebar
    // Mobile: Fixed Drawer Overlay
    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => useSceneStore.getState().toggleSidebar()}
                />
            )}

            <motion.div
                initial={isMobile ? { x: "100%" } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                    "flex flex-col shrink-0 transition-shadow duration-300",
                    "glass-sidebar border-l border-white/20 dark:border-white/5 shadow-2xl z-50",
                    isMobile
                        ? "fixed inset-y-0 right-0 w-[85vw] max-w-[360px] h-full"
                        : "relative h-full",
                    isDragging && !isMobile && "ring-2 ring-cyan-400/50"
                )}
                style={{ width: isMobile ? undefined : width }}
            >
                {/* Resize Handle - Desktop Only */}
                {!isMobile && <div {...resizeHandleProps} />}

                {/* Glossy Header */}
                <div className="h-14 flex items-center px-3 gap-3 bg-white/60 to-white/30 dark:bg-black/90 border-b border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm shrink-0">
                    <ChatSelector
                        items={chatItems}
                        activeChatId={activeChatId}
                        onSelect={setActiveChat}
                        onReload={handleReload}
                    />
                </div>

                {/* Chat Content */}
                <div className="flex-1 bg-black/5 dark:bg-black/80 relative overflow-hidden backdrop-blur-sm">
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
        </>
    )
}
