import { useMemo } from "react"

/**
 * Shared hook for getting embed host information (parent/origin)
 * Prevents code duplication across embed components
 */
export function useEmbedHost() {
    const hostname = useMemo(() => {
        if (typeof window !== "undefined") return window.location.hostname
        return ""
    }, [])

    const origin = useMemo(() => {
        if (typeof window !== "undefined") return window.location.origin
        return ""
    }, [])

    return { hostname, origin }
}
