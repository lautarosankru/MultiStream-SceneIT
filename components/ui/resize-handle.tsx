"use client"

import { cn } from "@/lib/utils"

interface ResizeHandleProps {
    className?: string
    handleAxis?: string
    visible?: boolean
}

export function ResizeHandle({ className, handleAxis, visible, ...props }: ResizeHandleProps) {
    return (
        <div
            className={cn(
                "absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 flex items-end justify-end p-1",
                visible ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                className
            )}
            {...props}
        >
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-tl-lg shadow-sm" />
        </div>
    )
}
