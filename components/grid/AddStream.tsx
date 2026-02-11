"use client"

import { useState } from "react"
import { useSceneStore } from "@/store/useSceneStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddStream() {
    const [url, setUrl] = useState("")
    const addItem = useSceneStore((state) => state.addItem)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!url.trim()) return

        addItem(url)
        toast.success("Stream agregado", {
            description: url
        })
        setUrl("")
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
            <Input
                type="text"
                placeholder="Twitch, YouTube, Kick URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50"
            />
            <Button type="submit" variant="default" className="gap-2 bg-primary text-black hover:bg-primary/90 rounded-full px-4 font-semibold">
                <Plus className="w-4 h-4" />
                Add
            </Button>
        </form>
    )
}
