"use client"

import { useState } from "react"
import { useSceneStore } from "@/store/useSceneStore"
import { compressLayout } from "@/lib/compression"
import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ShareButton() {
    const items = useSceneStore((state) => state.items)
    const [copied, setCopied] = useState(false)

    const handleShare = () => {
        if (items.length === 0) {
            toast.error("Agrega streams antes de compartir")
            return
        }

        const layoutString = compressLayout(items)
        const url = `${window.location.origin}?layout=${layoutString}`

        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copiado al portapapeles")

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="sm" // Smaller size for header
            onClick={handleShare}
            className={cn(
                "h-8 px-2 text-slate-400 hover:text-white transition-colors",
                // If we want it to look like a Pill:
                // "bg-white/5 hover:bg-white/10 rounded-full"
            )}
            title="Compartir Layout"
        >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
        </Button>
    )
}
