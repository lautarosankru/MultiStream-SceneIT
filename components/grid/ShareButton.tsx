"use client"

import { useState, useMemo } from "react"
import { useSceneStore } from "@/store/useSceneStore"
import { compressLayout } from "@/lib/compression"
import { generateFriendlyUrl } from "@/lib/streamers"
import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ShareButton() {
    const items = useSceneStore((state) => state.items)
    const [copied, setCopied] = useState(false)

    // Generate friendly URL from current items
    const friendlyUrl = useMemo(() => {
        if (items.length === 0) return null
        
        // Only generate friendly URL if all items are supported platforms
        const supportedItems = items.filter(item => 
            ['kick', 'twitch', 'youtube'].includes(item.platform)
        )
        
        if (supportedItems.length !== items.length) {
            return null // Some items are custom, use compressed URL instead
        }

        const streamers = supportedItems.map(item => ({
            platform: item.platform,
            username: item.sourceId
        }))

        return generateFriendlyUrl(streamers)
    }, [items])

    const handleShare = () => {
        if (items.length === 0) {
            toast.error("Agrega streams antes de compartir")
            return
        }

        let url: string

        if (friendlyUrl) {
            // Friendly URL format: /kick/coscu/twitch/coker
            // This goes through [...slug] which redirects to ?streamers=
            url = `${window.location.origin}${friendlyUrl}`
        } else {
            // Fallback to compressed layout
            const layoutString = compressLayout(items)
            url = `${window.location.origin}?layout=${layoutString}`
        }

        navigator.clipboard.writeText(url)
        setCopied(true)
        
        if (friendlyUrl) {
            toast.success("Link copiado")
        } else {
            toast.success("Link copiado al portapapeles")
        }

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className={cn(
                "h-8 px-2 text-slate-400 hover:text-white transition-colors",
            )}
            title={friendlyUrl ? "Compartir URL amigable" : "Compartir Layout"}
        >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
        </Button>
    )
}
