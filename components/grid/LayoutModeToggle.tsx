"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function LayoutModeToggle() {
    const { layoutMode, setLayoutMode, spotlightLayout, autoLayout } = useSceneStore()

    const handleAutoClick = () => {
        setLayoutMode('auto')
        autoLayout()
    }

    const handleSpotlightClick = () => {
        setLayoutMode('spotlight')
        spotlightLayout()
    }

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/40 shadow-inner">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoClick}
                className={cn(
                    "h-8 px-3 rounded-full text-xs font-semibold transition-all duration-300 gap-1.5",
                    layoutMode === 'auto'
                        ? "bg-primary/90 text-white shadow-lg ring-2 ring-primary/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
                title="Grid automático uniforme"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Auto</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleSpotlightClick}
                className={cn(
                    "h-8 px-3 rounded-full text-xs font-semibold transition-all duration-300 gap-1.5",
                    layoutMode === 'spotlight'
                        ? "bg-amber-500/90 text-white shadow-lg ring-2 ring-amber-500/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
                title="Stream principal destacado"
            >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Spotlight</span>
            </Button>
        </div>
    )
}
