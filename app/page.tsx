"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { SceneGrid } from "@/components/grid/SceneGrid"
import { AddStream } from "@/components/grid/AddStream"
import { ShareButton } from "@/components/grid/ShareButton"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { KickConnectButton } from "@/components/kick/KickConnectButton"
import { useSceneStore } from "@/store/useSceneStore"
import { decompressLayout } from "@/lib/compression"
import { parseSlugs } from "@/lib/streamers"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { LayoutTemplate, PanelRightOpen, PanelRightClose, Edit2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/grid/EmptyState"
import { LiquidBackground } from "@/components/ui/LiquidBackground"
import { TotalViewers } from "@/components/ui/TotalViewers"
import { StreamItem } from "@/types/scene"
import { LayoutModeToggle } from "@/components/grid/LayoutModeToggle"

interface ValidationResult {
  platform: string
  username: string
  valid: boolean
  isLive?: boolean
  avatar?: string | null
  displayName?: string
  error?: string
}

function HomeContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const layoutParam = searchParams.get("layout")
  const usernamesParam = searchParams.get("s") // usernames: ?s=coscu,coker&p=kick,twitch
  const { setItems, items, isLocked, toggleLock, isSidebarOpen, toggleSidebar, chatSidebarWidth, setChatSidebarWidth, kickUser } = useSceneStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingStreamers, setIsLoadingStreamers] = useState(false)
  const [validationProgress, setValidationProgress] = useState<string | null>(null)

  // Handle friendly URL (e.g., /coscu/coker/goncho) - DEPRECATED: use ?streamers= instead
  useEffect(() => {
    const loadFromFriendlyUrl = async () => {
      // Skip if we have streamers param (new system)
      if (usernamesParam) return

      // Parse path segments (skip empty and leading slash)
      const pathSegments = pathname.split('/').filter(s => s && s.length > 0)

      if (pathSegments.length > 0 && !layoutParam && !isLoaded) {
        console.log('[SceneIt] Loading from friendly URL:', pathSegments)
        setIsLoadingStreamers(true)

        try {
          const parsedStreamers = parseSlugs(pathSegments)
          console.log('[SceneIt] Parsed streamers:', parsedStreamers)

          if (parsedStreamers.length === 0) {
            setIsLoadingStreamers(false)
            return
          }

          // Validate streamers via API
          setValidationProgress(`Validando ${parsedStreamers.length} streamer(s)...`)

          const response = await fetch('/api/streamers/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              streamers: parsedStreamers.map(s => ({ platform: s.platform, username: s.username }))
            })
          })

          if (!response.ok) {
            throw new Error('Validation failed')
          }

          const { results } = await response.json()
          const validResults = results.filter((r: ValidationResult) => r.valid)

          console.log('[SceneIt] Validation results:', results)

          if (validResults.length === 0) {
            toast.error("Ningún streamer encontrado")
            setIsLoadingStreamers(false)
            setValidationProgress(null)
            return
          }

          // Report invalid streamers
          const invalidResults = results.filter((r: ValidationResult) => !r.valid)
          if (invalidResults.length > 0) {
            invalidResults.forEach((r: ValidationResult) => {
              toast.error(`"${r.username}" no encontrado en ${r.platform}`)
            })
          }

          // Convert to StreamItems
          const streamItems: StreamItem[] = validResults.map((result: ValidationResult, index: number) => {
            const cols = Math.ceil(Math.sqrt(validResults.length))
            const rows = Math.ceil(validResults.length / cols)

            return {
              id: `stream-${Date.now()}-${index}`,
              type: 'video' as const,
              platform: result.platform as 'kick' | 'twitch' | 'youtube',
              sourceId: result.username,
              isMuted: index !== 0, // Mute all except first
              layout: {
                i: `stream-${Date.now()}-${index}`,
                x: (index % cols) * (12 / cols),
                y: Math.floor(index / cols) * (12 / rows),
                w: Math.floor(12 / cols),
                h: Math.floor(12 / rows),
                minW: 3,
                minH: 3
              }
            }
          })

          // Clear existing items before loading new ones
          setItems([])

          setItems(streamItems)
          toast.success(`${validResults.length} stream(s) cargado(s)`)

        } catch (error) {
          console.error('[SceneIt] Error loading from friendly URL:', error)
          toast.error("Error al cargar los streams")
        } finally {
          setIsLoadingStreamers(false)
          setValidationProgress(null)
        }
      }
    }

    loadFromFriendlyUrl()
  }, [pathname, layoutParam, setItems, isLoaded])

  // Handle Import from URL (compressed layout)
  useEffect(() => {
    if (layoutParam && !isLoaded) {
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
    } else if (!layoutParam) {
      setIsLoaded(true)
    }
  }, [layoutParam, setItems, isLoaded])

  // Handle ?s=coscu,coker&p=kick,twitch (from [...slug] friendly URLs)
  useEffect(() => {
    const loadFromStreamersParam = async () => {
      if (!usernamesParam || isLoaded) return

      console.log('[SceneIt] Loading from streamers param:', usernamesParam)
      setIsLoadingStreamers(true)

      try {
        const usernames = usernamesParam.split(',').filter(s => s.length > 0)

        // Get platforms from &p= param
        const platformParam = searchParams.get("p")
        const platforms = platformParam ? platformParam.split(',').filter(s => s.length > 0) : []

        console.log('[SceneIt] Parsed params:', { usernames, platforms })

        if (usernames.length === 0) {
          setIsLoadingStreamers(false)
          return
        }

        setValidationProgress(`Validando ${usernames.length} streamer(s)...`)

        // Build streamers array with explicit platforms
        const streamersToValidate = usernames.map((username, index) => ({
          platform: platforms[index] || 'kick', // Default to kick if no platform specified
          username
        }))

        console.log('[SceneIt] Streamers to validate:', streamersToValidate)

        const response = await fetch('/api/streamers/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamers: streamersToValidate })
        })

        if (!response.ok) {
          throw new Error('Validation failed')
        }

        const { results } = await response.json()
        const validResults = results.filter((r: ValidationResult) => r.valid)

        console.log('[SceneIt] Validation results:', results)

        if (validResults.length === 0) {
          toast.error("Ningún streamer encontrado")
          setIsLoadingStreamers(false)
          setValidationProgress(null)
          return
        }

        const invalidResults = results.filter((r: ValidationResult) => !r.valid)
        if (invalidResults.length > 0) {
          invalidResults.forEach((r: ValidationResult) => {
            toast.error(`"${r.username}" no encontrado en ${r.platform}`)
          })
        }

        const streamItems: StreamItem[] = validResults.map((result: ValidationResult, index: number) => {
          const cols = Math.ceil(Math.sqrt(validResults.length))
          const rows = Math.ceil(validResults.length / cols)

          return {
            id: `stream-${Date.now()}-${index}`,
            type: 'video' as const,
            platform: result.platform as 'kick' | 'twitch' | 'youtube',
            sourceId: result.username,
            isMuted: index !== 0,
            layout: {
              i: `stream-${Date.now()}-${index}`,
              x: (index % cols) * (12 / cols),
              y: Math.floor(index / cols) * (12 / rows),
              w: Math.floor(12 / cols),
              h: Math.floor(12 / rows),
              minW: 3,
              minH: 3
            }
          }
        })

        setItems([])
        setItems(streamItems)
        toast.success(`${validResults.length} stream(s) cargado(s)`)

      } catch (error) {
        console.error('[SceneIt] Error loading from streamers param:', error)
        toast.error("Error al cargar los streams")
      } finally {
        setIsLoadingStreamers(false)
        setValidationProgress(null)
      }
    }

    loadFromStreamersParam()
  }, [usernamesParam, isLoaded, setItems, searchParams])

  return (
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans antialiased selection:bg-primary/30">
      {/* Top Bar - Frutiger Aero Glass */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/50 dark:border-white/5 bg-gradient-to-b from-white/70 to-white/40 dark:from-black/80 dark:to-black/60 backdrop-blur-md shrink-0 z-50 shadow-sm">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 w-auto lg:w-40 group cursor-default shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-white/50">
            <LayoutTemplate className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-blue-900 dark:text-white tracking-tight drop-shadow-sm hidden sm:inline">
            Scene<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-lime-600 dark:from-cyan-400 dark:to-lime-400 italic">It</span>
          </span>
          <TotalViewers />
        </div>

        {/* Center: Controls */}
        <div className="flex-1 flex items-center justify-center mx-2">
          <AddStream />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 lg:gap-2 w-auto lg:w-44 justify-end shrink-0">
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

          <LayoutModeToggle />

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
        <div className="flex-1 overflow-hidden relative">
          {/* Loading State for Friendly URLs */}
          {isLoadingStreamers ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Cargando streams
                </p>
                {validationProgress && (
                  <p className="text-sm text-slate-500">{validationProgress}</p>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <SceneGrid />
          )}
        </div>
        <ChatSidebar />
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
      <LiquidBackground />
      <HomeContent />
    </Suspense>
  )
}
