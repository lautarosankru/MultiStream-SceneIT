"use client"

import { useState, useCallback } from "react"
import { useSceneStore } from "@/store/useSceneStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddStream() {
    const [url, setUrl] = useState("")
    const addItem = useSceneStore((state) => state.addItem)

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (!url.trim()) return

        addItem(url)
        toast.success("Stream agregado", {
            description: url
        })
        setUrl("")
    }, [url, addItem])

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
            <Input
                type="text"
                placeholder="Twitch, YouTube, Kick URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30 focus-visible:ring-primary/50"
            />
            <Button type="submit" variant="default" className="gap-2 bg-primary text-black hover:bg-primary/90 rounded-full px-4 font-semibold">
                <Plus className="w-4 h-4" />
                Add
            </Button>
        </form>
    )
}
