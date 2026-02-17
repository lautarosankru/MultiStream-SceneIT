"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface UseResizableOptions {
    initialWidth: number
    minWidth: number
    maxWidth: number | ((viewportWidth: number) => number)
    edge: 'left' | 'right'
    onResizeStart?: () => void
    onResize?: (width: number) => void
    onResizeEnd?: (width: number) => void
}

interface UseResizableReturn {
    width: number
    isDragging: boolean
    handleMouseDown: (e: React.MouseEvent) => void
    resizeHandleProps: {
        onMouseDown: (e: React.MouseEvent) => void
        className: string
        style: React.CSSProperties
    }
}

export function useResizable({
    initialWidth,
    minWidth,
    maxWidth,
    edge,
    onResizeStart,
    onResize,
    onResizeEnd
}: UseResizableOptions): UseResizableReturn {
    const [width, setWidth] = useState(initialWidth)
    const [isDragging, setIsDragging] = useState(false)
    const startXRef = useRef(0)
    const startWidthRef = useRef(initialWidth)
    const currentWidthRef = useRef(initialWidth)
    const onResizeRef = useRef(onResize)
    const onResizeEndRef = useRef(onResizeEnd)
    const onResizeStartRef = useRef(onResizeStart)

    // Keep refs updated
    useEffect(() => {
        onResizeRef.current = onResize
        onResizeEndRef.current = onResizeEnd
        onResizeStartRef.current = onResizeStart
    }, [onResize, onResizeEnd, onResizeStart])

    // Initialize after mount and sync with external changes
    useEffect(() => {
        if (initialWidth !== width && !isDragging) {
            setWidth(initialWidth)
            currentWidthRef.current = initialWidth
        }
    }, [initialWidth])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
        startXRef.current = e.clientX
        startWidthRef.current = currentWidthRef.current

        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
        document.body.style.cursor = 'col-resize'

        onResizeStartRef.current?.()
    }, [])

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startXRef.current
            const newWidth = edge === 'left'
                ? startWidthRef.current - delta
                : startWidthRef.current + delta

            const computedMax = typeof maxWidth === 'function'
                ? maxWidth(window.innerWidth)
                : maxWidth

            const clampedWidth = Math.min(
                computedMax,
                Math.max(minWidth, newWidth)
            )

            currentWidthRef.current = clampedWidth
            setWidth(clampedWidth)
            onResizeRef.current?.(clampedWidth)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            cleanup()
            onResizeEndRef.current?.(currentWidthRef.current)
        }

        const cleanup = () => {
            document.body.style.userSelect = ''
            document.body.style.webkitUserSelect = ''
            document.body.style.cursor = ''
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseleave', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mouseleave', handleMouseUp)
            cleanup()
        }
    }, [isDragging, edge, minWidth, maxWidth])

    return {
        width,
        isDragging,
        handleMouseDown,
        resizeHandleProps: {
            onMouseDown: handleMouseDown,
            className: cn(
                'absolute top-0 h-full cursor-col-resize transition-colors z-10',
                edge === 'left' ? 'left-0' : 'right-0',
                isDragging ? 'bg-cyan-400 w-1' : 'bg-transparent hover:bg-cyan-400/50 w-3'
            ),
            style: {
                // Touch-friendly hit area - más ancho que el visual
                width: isDragging ? '4px' : '12px',
            }
        }
    }
}
