"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SceneGrid } from "@/components/grid/SceneGrid"
import { AddStream } from "@/components/grid/AddStream"
import { ShareButton } from "@/components/grid/ShareButton"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { KickConnectButton } from "@/components/kick/KickConnectButton"
import { useSceneStore } from "@/store/useSceneStore"
import { decompressLayout } from "@/lib/compression" // Use new decompression
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, PanelRightOpen, PanelRightClose, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"

function HomeContent() {
  const searchParams = useSearchParams()
  const layoutParam = searchParams.get("layout") // This will now expect LZString
  // We check legacy support potentially or just overwrite
  const { setItems, items, isLocked, toggleLock, isSidebarOpen, toggleSidebar } = useSceneStore()
  const [isLoaded, setIsLoaded] = useState(false)

  // Handle Import from URL
  useEffect(() => {
    if (layoutParam && !isLoaded) {
      // Try decompression first
      try {
        const importedItems = decompressLayout(layoutParam)
        if (importedItems && importedItems.length > 0) {
          setItems(importedItems)
          toast.success("Layout cargado correctamente")
        }
      } catch {
        console.error("Failed to decompress")
      }
      setIsLoaded(true)
    }
  }, [layoutParam, setItems, isLoaded])

  return (
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans antialiased">
      {/* Top Bar - Linear Style */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0 z-50 glossy-shine">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 w-48 group cursor-default">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:glow-lime transition-all duration-300">
            <LayoutTemplate className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Scene<span className="text-primary italic">It</span>
          </span>
        </div>

        {/* Center: Controls */}
        <div className="flex-1 max-w-2xl mx-auto flex items-center justify-center">
          <AddStream />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-48 justify-end">
          <KickConnectButton />
          <Button
            variant={!isLocked ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleLock}
            className={cn(
              "h-9 px-4 gap-2 text-sm font-semibold transition-all duration-300 rounded-full",
              !isLocked
                ? "bg-primary text-black hover:bg-primary/90 glow-lime"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">{!isLocked ? "Listo" : "Editar"}</span>
          </Button>

          <ShareButton />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const { autoLayout } = useSceneStore.getState()
              autoLayout()
              toast.success("Layout organizado")
            }}
            className="h-9 w-9 transition-colors hover:bg-white/5 text-slate-400 hover:text-primary"
            title="Auto-organizar grilla"
          >
            <LayoutTemplate className="h-5 w-5" />
          </Button>

          <div className="w-px h-6 bg-white/5 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-9 w-9 transition-all duration-300 hover:bg-white/5",
              isSidebarOpen ? "text-primary shadow-[0_0_10px_rgba(180,255,50,0.2)]" : "text-slate-400"
            )}
            title="Chat Sidebar"
          >
            {isSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Grid Container */}
        <div className="flex-1 overflow-hidden relative bg-background/50">
          {items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none pointer-events-none">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <LayoutTemplate className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Lienzo Vacío</h2>
              <p className="text-slate-500 text-sm">
                Agrega streams para comenzar.
              </p>
            </div>
          ) : (
            <SceneGrid />
          )}
        </div>

        {/* Sidebar */}
        <ChatSidebar />
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <HomeContent />
    </Suspense>
  )
}
