"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { StreamItem } from "@/types/scene"
import { cn } from "@/lib/utils"
import { MuteButton } from "./MuteButton"
import { RemoveButton } from "./RemoveButton"
import { DragHandle } from "./DragHandle"

interface StreamControlsProps {
    item: StreamItem
}

export function StreamControls({ item }: StreamControlsProps) {
    const { isLocked, toggleMute, removeItem } = useSceneStore()

    // Render Controls
    // Logic:
    // - If Locked (View Mode): Only show Mute button on hover? Or always if we want accessibility.
    //   User said "Standard". Standard is usually hover controls in view mode, persistent in edit.
    //   But to simplify and ensure they are reachable, let's make them always visible in Edit Mode,
    //   and visible on Hover in View Mode.

    return (
        <div className={cn(
            "absolute top-0 right-0 z-50 flex items-center p-1 gap-1",
            "transition-opacity duration-200",
            !isLocked
                ? "opacity-100 bg-black/60 rounded-bl-lg backdrop-blur-sm" // Edit Mode: Always visible, solid background
                : "opacity-0 group-hover:opacity-100 bg-black/40 rounded-bl-lg" // View Mode: Hover only
        )}>
            {/* Drag Handle - Only in Edit Mode */}
            {!isLocked && <DragHandle />}

            {/* Mute - Always available (on hover or edit) */}
            <MuteButton
                isMuted={item.isMuted}
                onToggle={() => toggleMute(item.id)}
            />

            {/* Remove - Only in Edit Mode */}
            {!isLocked && (
                <RemoveButton onRemove={() => removeItem(item.id)} />
            )}
        </div>
    )
}
