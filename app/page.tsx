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
import { ThemeToggle } from "@/components/ui/ThemeToggle"
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
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans antialiased selection:bg-primary/30">
      {/* Top Bar - Frutiger Aero Glass */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/50 dark:border-white/5 bg-gradient-to-b from-white/70 to-white/40 dark:from-black/80 dark:to-black/60 backdrop-blur-md shrink-0 z-50 shadow-sm">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 w-48 group cursor-default">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-white/50">
            <LayoutTemplate className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-blue-900 dark:text-white tracking-tight drop-shadow-sm">
            Scene<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-lime-600 dark:from-cyan-400 dark:to-lime-400 italic">It</span>
          </span>
        </div>

        {/* Center: Controls */}
        <div className="flex-1 max-w-2xl mx-auto flex items-center justify-center">
          <AddStream />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-48 justify-end">
          <KickConnectButton />
          <Button
            variant={!isLocked ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleLock}
            className={cn(
              "h-9 px-4 gap-2 text-sm font-semibold transition-all duration-300 rounded-full",
              !isLocked
                ? "glossy-btn text-white ring-2 ring-white/50"
                : "text-slate-600 hover:text-blue-900 hover:bg-white/40"
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
            className="h-9 w-9 transition-colors hover:bg-white/40 text-slate-600 hover:text-blue-900 rounded-full"
            title="Auto-organizar grilla"
          >
            <LayoutTemplate className="h-5 w-5" />
          </Button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-9 w-9 transition-all duration-300 hover:bg-white/40 rounded-full",
              isSidebarOpen ? "text-cyan-600 shadow-[0_0_15px_rgba(0,255,255,0.4)] bg-white/50" : "text-slate-600 dark:text-slate-400"
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
        <div className="flex-1 overflow-hidden relative">
          {items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none pointer-events-none">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                <LayoutTemplate className="h-12 w-12 text-white/40" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">Lienzo Vacío</h2>
              <p className="text-white/60 text-base">
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

import { LiquidBackground } from "@/components/ui/LiquidBackground"

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
      <LiquidBackground />
      <HomeContent />
    </Suspense>
  )
}
