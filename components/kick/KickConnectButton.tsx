"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useSceneStore } from "@/store/useSceneStore"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"
import { toast } from "sonner"

export function KickConnectButton() {
    const { kickUser, setKickUser } = useSceneStore()
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    // Check session on mount
    useEffect(() => {
        if (!kickUser) {
            fetch('/api/auth/kick/me')
                .then(res => {
                    if (res.ok) return res.json()
                    // If 401 or error, we are not logged in
                    return null
                })
                .then(data => {
                    if (data) setKickUser(data)
                })
                .catch(() => {
                    // Ignore error, just not logged in
                })
        }
    }, [])

    // Handle OAuth Callback Success/Error from URL
    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'kick_connected') {
            // Fetch user data
            setIsLoading(true)
            fetch('/api/auth/kick/me')
                .then(res => {
                    if (res.ok) return res.json()
                    throw new Error('Failed to fetch user')
                })
                .then(data => {
                    setKickUser(data)
                    toast.success("Conectado a Kick correctamente")
                    // Clean URL
                    router.replace('/')
                })
                .catch(err => {
                    console.error(err)
                    // toast.error("Error al obtener datos de usuario") 
                    // Suppress error toast to avoid spam on initial load/redirect if strict mode
                })
                .finally(() => setIsLoading(false))
        } else if (error) {
            toast.error(`Error de conexión: ${error}`)
            router.replace('/')
        }
    }, [searchParams, router, setKickUser]) // Removed kickUser dependency to avoid loop if ensuring sync

    const handleLogin = () => {
        setIsLoading(true)
        window.location.href = '/api/auth/kick'
    }

    const handleLogout = () => {
        // Clear cookie via API? Or just clear local state?
        // Ideally call an endpoint to delete cookie.
        // For now, clear state.
        setKickUser(null)
        // Optional: call /api/auth/kick/logout to clear cookies
        document.cookie = 'kick_access_token=; Max-Age=0; path=/;'
        document.cookie = 'kick_refresh_token=; Max-Age=0; path=/;'
        toast.success("Desconectado de Kick")
    }

    if (kickUser) {
        return (
            <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Conectado como</p>
                    <p className="text-sm font-bold text-[#53FC18]">{kickUser.username}</p>
                </div>
                {kickUser.profile_pic && (
                    <img src={kickUser.profile_pic} alt={kickUser.username} className="w-8 h-8 rounded-full border border-[#53FC18]" />
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Desconectar">
                    <LogOut className="h-4 w-4 text-red-400" />
                </Button>
            </div>
        )
    }

    return (
        <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="bg-[#53FC18] text-black hover:bg-[#42ca13] font-bold"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Conectar Kick"}
        </Button>
    )
}
