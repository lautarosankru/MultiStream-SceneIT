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
    const startWidthRef = useRef(0)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        startXRef.current = e.clientX
        startWidthRef.current = width

        // Prevenir selección de texto durante drag
        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
        document.body.style.cursor = 'col-resize'

        onResizeStart?.()
    }, [width, onResizeStart])

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startXRef.current

            // Calcular nuevo ancho basado en el edge
            // Si el edge es 'left' (sidebar a la derecha), aumentar width al mover a la izquierda (delta negativo)
            // Si el edge es 'right' (sidebar a la izquierda), aumentar width al mover a la derecha (delta positivo)
            const newWidth = edge === 'left'
                ? startWidthRef.current - delta  // Sidebar a la derecha: restar delta
                : startWidthRef.current + delta  // Sidebar a la izquierda: sumar delta

            // Calcular max dinámico si es función
            const computedMax = typeof maxWidth === 'function'
                ? maxWidth(window.innerWidth)
                : maxWidth

            const clampedWidth = Math.min(
                computedMax,
                Math.max(minWidth, newWidth)
            )

            setWidth(clampedWidth)
            onResize?.(clampedWidth)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            // Restaurar estilos del body
            document.body.style.userSelect = ''
            document.body.style.webkitUserSelect = ''
            document.body.style.cursor = ''
            onResizeEnd?.(width)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseleave', handleMouseUp) // Cleanup si el mouse sale del viewport

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mouseleave', handleMouseUp)

            // Cleanup crucial en caso de unmount durante drag
            document.body.style.userSelect = ''
            document.body.style.webkitUserSelect = ''
            document.body.style.cursor = ''
        }
    }, [isDragging, edge, minWidth, maxWidth, onResize, onResizeEnd, width])

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
