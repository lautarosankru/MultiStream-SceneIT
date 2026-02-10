"use client"

import { Move } from "lucide-react"

export function DragHandle() {
    return (
        <div className="drag-handle cursor-grab active:cursor-grabbing p-2 hover:bg-white/20 rounded-md text-white transition-colors">
            <Move className="h-4 w-4" />
        </div>
    )
}
