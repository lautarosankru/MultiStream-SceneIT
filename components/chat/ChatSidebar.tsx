"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { ChatEmbed } from "./embeds/ChatEmbed"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"

const MIN_SIDEBAR_WIDTH = 280
const MAX_SIDEBAR_WIDTH = 800

export function ChatSidebar() {
    const {
        items,
        activeChatId,
        setActiveChat,
        isSidebarOpen,
        sidebarWidth,
        setSidebarWidth
    } = useSceneStore()

    // Resize handling
    const isResizing = useRef(false)
    const startX = useRef(0)
    const startWidth = useRef(0)
    const [isDragging, setIsDragging] = useState(false)

    const startResize = useCallback((e: React.MouseEvent) => {
        isResizing.current = true
        startX.current = e.clientX
        startWidth.current = sidebarWidth
        setIsDragging(true)
        e.preventDefault()
    }, [sidebarWidth])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return

        const deltaX = e.clientX - startX.current
        const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth.current + deltaX))
        setSidebarWidth(newWidth)
    }, [setSidebarWidth])

    const stopResize = useCallback(() => {
        isResizing.current = false
        setIsDragging(false)
    }, [])

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', stopResize)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', stopResize)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isDragging, handleMouseMove, stopResize])

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
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col shrink-0 transition-all duration-300 glass dark:bg-black dark:backdrop-blur-none border-l border-white/20 dark:border-white/5 shadow-2xl z-50 relative"
            style={{ width: sidebarWidth }}
        >
            {/* Resize Handle - Left Edge */}
            <div
                className={cn(
                    "absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-10 transition-colors duration-200",
                    isDragging 
                        ? "bg-cyan-400" 
                        : "bg-transparent hover:bg-cyan-400/50"
                )}
                onMouseDown={startResize}
            />
            
            {/* Resize Guide Line */}
            {isDragging && (
                <div className="absolute left-0 top-0 h-full w-px bg-cyan-400/30 pointer-events-none z-20" />
            )}
            {/* Glossy Header */}
            <div className="h-12 flex items-center px-2 gap-2 bg-gradient-to-b from-white/60 to-white/30 dark:bg-black border-b border-white/50 dark:border-white/5 backdrop-blur-md shadow-sm">
                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar mask-linear py-1">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveChat(item.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all relative group shrink-0 rounded-full border border-transparent",
                                activeChatId === item.id
                                    ? "bg-white/60 dark:bg-white/10 text-blue-900 dark:text-cyan-400 shadow-sm border-white/50 dark:border-white/10 ring-1 ring-white/60 dark:ring-white/5"
                                    : "text-slate-600 dark:text-slate-400 hover:text-blue-800 dark:hover:text-cyan-300 hover:bg-white/30 dark:hover:bg-white/5"
                            )}
                        >
                            {/* Platform Icon Dot with Glow */}
                            <span className={cn(
                                "w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]",
                                item.platform === 'twitch' ? 'bg-[#9146FF] text-[#9146FF]' :
                                    item.platform === 'kick' ? 'bg-[#53FC18] text-[#53FC18]' :
                                        item.platform === 'youtube' ? 'bg-[#FF0000] text-[#FF0000]' : 'bg-gray-500 text-gray-500'
                            )} />
                            <span className="truncate max-w-[80px]">{item.sourceId}</span>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center pl-2 border-l border-white/30">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-blue-900 hover:bg-white/40 rounded-full transition-all"
                        onClick={handleReload}
                        title="Recargar Chat"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
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
