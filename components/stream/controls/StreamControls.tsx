"use client"

import { useSceneStore } from "@/store/useSceneStore"
import { StreamItem } from "@/types/scene"
import { cn } from "@/lib/utils"
import { RemoveButton } from "./RemoveButton"
import { DragHandle } from "./DragHandle"

interface StreamControlsProps {
    item: StreamItem
}

export function StreamControls({ item }: StreamControlsProps) {
    const { isLocked, removeItem } = useSceneStore()

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

            {/* Remove - Only in Edit Mode */}
            {!isLocked ? (
                <RemoveButton onRemove={() => removeItem(item.id)} />
            ) : null}
        </div>
    )
}
