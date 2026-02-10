"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import type { StreamItem } from "@/types/scene"

interface MuteButtonProps {
    isMuted: boolean
    onToggle: () => void
}

export function MuteButton({ isMuted, onToggle }: MuteButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20 text-white"
            onClick={(e) => {
                e.stopPropagation() // Prevent drag start if clicked
                onToggle()
            }}
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
    )
}
