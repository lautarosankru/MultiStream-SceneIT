"use client"

import { useState, useMemo, useCallback } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { MessageSquare, RefreshCw, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATFORM_COLORS } from "@/lib/constants"

interface ChatSelectorProps {
    items: Array<{ id: string; sourceId: string; platform: string }>
    activeChatId: string | null
    onSelect: (id: string) => void
    onReload: () => void
}

export function ChatSelector({
    items,
    activeChatId,
    onSelect,
    onReload,
}: ChatSelectorProps) {
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
                        "glossy-btn flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all relative group",
                        "text-slate-800 dark:text-slate-100",
                        "hover:scale-[1.02] active:scale-[0.98]",
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
                className="w-64 p-1.5 glass-panel rounded-xl animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto custom-scrollbar">
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
                                        "w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_4px_currentColor]",
                                        pStyle.bg,
                                        pStyle.text
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
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors group"
                    >
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Recargar chat</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
