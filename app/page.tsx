"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { SceneGrid } from "@/components/grid/SceneGrid"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useSceneStore } from "@/store/useSceneStore"
import { decompressLayout } from "@/lib/compression"
import { parseSlugs } from "@/lib/streamers"
import { toast } from "sonner"
import { Header } from "@/components/layout/Header"
import { Loader2 } from "lucide-react"
import { EmptyState } from "@/components/grid/EmptyState"
import { LiquidBackground } from "@/components/ui/LiquidBackground"
import { StreamItem, ValidationResult } from "@/types/scene"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

function HomeContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const layoutParam = searchParams.get("layout")
  const layoutModeParam = searchParams.get("layoutMode")
  const usernamesParam = searchParams.get("s")
  const { setItems, items, setLayoutMode } = useSceneStore()

  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingStreamers, setIsLoadingStreamers] = useState(false)
  const [validationProgress, setValidationProgress] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const processStreamers = useCallback(async (parsedStreamers: { platform: string; username: string }[]) => {
    if (loadingRef.current || parsedStreamers.length === 0) return
    loadingRef.current = true
    setIsLoadingStreamers(true)

    try {
      setValidationProgress(`Validando ${parsedStreamers.length} streamer(s)...`)

      const response = await fetch('/api/streamers/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamers: parsedStreamers })
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const { results } = await response.json()
      const validResults = Array.isArray(results) ? results.filter((r: ValidationResult) => r.valid) : []

      if (validResults.length === 0) {
        toast.error("Ningún streamer encontrado")
        setValidationProgress(null)
        loadingRef.current = false
        return
      }

      const invalidResults = Array.isArray(results) ? results.filter((r: ValidationResult) => !r.valid) : []
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

      setItems(streamItems)
      toast.success(`${validResults.length} stream(s) cargado(s)`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[SceneIt] Error loading streamers:', errorMessage)
      toast.error("Error al cargar los streams")
    } finally {
      setIsLoadingStreamers(false)
      setValidationProgress(null)
      loadingRef.current = false
    }
  }, [setItems])

  const loadFromFriendlyUrl = useCallback(async (pathSegments: string[]) => {
    const parsedStreamers = parseSlugs(pathSegments)
    if (parsedStreamers.length === 0) return

    const streamers = parsedStreamers.map(s => s.username)
    const platforms = parsedStreamers.map(s => s.platform)

    const redirectUrl = `/?s=${streamers.join(',')}&p=${platforms.join(',')}&layoutMode=auto`
    window.location.href = redirectUrl
  }, [])

  const loadFromStreamersParam = useCallback(async () => {
    if (!usernamesParam || loadingRef.current) return

    const usernames = usernamesParam.split(',').filter((s: string) => s.length > 0)
    const platformParam = searchParams.get("p")
    const platforms = platformParam ? platformParam.split(',').filter((s: string) => s.length > 0) : []

    if (usernames.length === 0) return

    const streamersToValidate = usernames.map((username: string, index: number) => ({
      platform: platforms[index] || 'kick',
      username
    }))

    await processStreamers(streamersToValidate)

    if (layoutModeParam === 'auto') {
      setLayoutMode('auto')
    }
  }, [usernamesParam, searchParams, processStreamers, layoutModeParam, setLayoutMode])

  useEffect(() => {
    if (layoutParam && !isLoaded) {
      try {
        const importedItems = decompressLayout(layoutParam)
        if (importedItems && importedItems.length > 0) {
          setItems(importedItems)
          toast.success("Layout cargado correctamente")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[SceneIt] Failed to decompress layout:', errorMessage)
      }
      setIsLoaded(true)
    } else if (!layoutParam && !isLoaded) {
      setIsLoaded(true)
    }
  }, [layoutParam, setItems, isLoaded])

  useEffect(() => {
    if (!isLoaded || loadingRef.current) return

    const pathSegments = pathname.split('/').filter((s: string) => s && s.length > 0)

    if (pathSegments.length > 0 && !usernamesParam) {
      loadFromFriendlyUrl(pathSegments)
    } else if (usernamesParam) {
      loadFromStreamersParam()
    }
  }, [pathname, layoutParam, usernamesParam, isLoaded, loadFromFriendlyUrl, loadFromStreamersParam])

  return (
    <main className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans antialiased selection:bg-primary/30">
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <ErrorBoundary>
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
        </ErrorBoundary>
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
