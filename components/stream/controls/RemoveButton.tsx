"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface RemoveButtonProps {
    onRemove: () => void
}

export function RemoveButton({ onRemove }: RemoveButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-500/20 text-white hover:text-red-400"
            onClick={(e) => {
                e.stopPropagation()
                onRemove()
            }}
            title="Remove Stream"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
