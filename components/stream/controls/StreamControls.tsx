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
            "absolute top-0 right-0 z-50 flex items-center p-1.5 gap-1.5",
            "transition-all duration-300",
            !isLocked
                ? "opacity-100 glass-panel rounded-bl-xl shadow-lg" // Edit Mode: Always visible
                : "opacity-0 group-hover:opacity-100 glass-panel rounded-bl-xl shadow-md" // View Mode: Hover only
        )}>
            {/* Drag Handle - Only in Edit Mode */}
            {!isLocked ? <DragHandle /> : null}

            {/* Mute - Always available (on hover or edit) */}
            <MuteButton
                isMuted={item.isMuted}
                onToggle={() => toggleMute(item.id)}
            />

            {/* Remove - Only in Edit Mode */}
            {!isLocked ? (
                <RemoveButton onRemove={() => removeItem(item.id)} />
            ) : null}
        </div>
    )
}
