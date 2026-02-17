import { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout"
import { useSceneStore } from "@/store/useSceneStore"
import { StreamWrapper } from "@/components/stream/StreamWrapper"
import { cn } from "@/lib/utils"
import { GRID_CONFIG } from "@/lib/config/grid"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

type ResizeHandle = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

function getResizeHandleElement(
    handle: ResizeHandle,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.Ref<HTMLElement>
): React.ReactNode {
    const isCorner = handle.includes("w") || handle.includes("e");
    const cursorClass = {
        "s": "cursor-s-resize",
        "n": "cursor-n-resize", 
        "e": "cursor-e-resize",
        "w": "cursor-w-resize",
        "se": "cursor-se-resize",
        "sw": "cursor-sw-resize",
        "ne": "cursor-ne-resize",
        "nw": "cursor-nw-resize",
    }[handle];

    return (
        <div
            ref={ref as React.Ref<HTMLDivElement>}
            className={cn(
                `react-resizable-handle react-resizable-handle-${handle}`,
                "z-50",
                cursorClass,
                "touch-none",
                "group",
                isCorner ? "w-8 h-8" : "bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20",
                handle === "s" || handle === "n" ? "h-2 left-0 right-0" : null,
                handle === "e" || handle === "w" ? "w-2 top-0 bottom-0" : null,
                handle === "se" ? "absolute bottom-0 right-0" : null,
                handle === "sw" ? "absolute bottom-0 left-0" : null,
                handle === "ne" ? "absolute top-0 right-0" : null,
                handle === "nw" ? "absolute top-0 left-0" : null,
            )}
            style={{
                position: handle === "s" || handle === "n" ? "absolute" : "absolute",
                [handle === "s" || handle === "n" ? "height" : "width"]: isCorner ? "24px" : "12px",
            }}
        >
            {isCorner && (
                <div className="w-4 h-4 m-2 flex items-center justify-center glossy-btn rounded-full shadow-[0_0_15px_rgba(135,255,50,0.6)] group-hover:scale-110 group-active:scale-95 transition-all duration-300 border border-white/40">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-2.5 h-2.5 text-white drop-shadow-md"
                    >
                        <path d="M15 19l4-4M10 19l9-9" />
                    </svg>
                </div>
            )}
        </div>
    )
}

export function SceneGrid() {
    const { items, updateLayout, isLocked, setDragging, layoutMode } = useSceneStore()
    const { width, containerRef, mounted } = useContainerWidth();
    const [containerHeight, setContainerHeight] = useState(0);

    // Track container height to calculate rowHeight
    useEffect(() => {
        if (!containerRef.current) return;

        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.offsetHeight);
            }
        };

        const observer = new ResizeObserver(updateHeight);
        observer.observe(containerRef.current);
        updateHeight();

        return () => observer.disconnect();
    }, [containerRef, mounted]);

    // Calculate rowHeight to fit exactly BASE_ROWS in the container
    const rowHeight = useMemo(() => {
        if (!containerHeight) return 30;
        const availableHeight = containerHeight - GRID_CONFIG.PADDING_Y - ((GRID_CONFIG.BASE_ROWS - 1) * GRID_CONFIG.MARGIN_Y);
        return Math.floor(availableHeight / GRID_CONFIG.BASE_ROWS);
    }, [containerHeight]);

    // Memoize layout to prevent unnecessary re-renders
    const layouts = useMemo(() => {
        return {
            lg: items.map(item => ({
                ...item.layout,
                i: item.id,
                static: isLocked
            }))
        }
    }, [items, isLocked])

    // In custom mode, NEVER auto-rearrange - preserve user's exact layout
    const itemsCountRef = useRef(items.length)
    
    useEffect(() => {
        if (items.length === 0) return

        // Only rearrange if items were added/removed, NOT on resize
        if (itemsCountRef.current === items.length) {
            return
        }
        
        itemsCountRef.current = items.length

        // Only apply auto-layout for auto/spotlight modes
        // In custom mode, new items get default position but existing stay put
        if (layoutMode === 'custom') {
            return
        }

        const hasInvalidItems = items.some(item => {
            const { x, y, w, h } = item.layout
            return y + h > GRID_CONFIG.MAX_ROWS || x + w > GRID_CONFIG.COLS
        })

        if (hasInvalidItems) {
            const newLayout = items.map(item => {
                const { x, y, w, h } = item.layout
                const clampedY = Math.max(0, Math.min(y, GRID_CONFIG.MAX_ROWS - h))
                const clampedH = Math.min(h, GRID_CONFIG.MAX_ROWS - clampedY)
                const clampedX = Math.max(0, Math.min(x, GRID_CONFIG.COLS - w))
                const clampedW = Math.min(w, GRID_CONFIG.COLS - clampedX)

                return {
                    i: item.id,
                    x: clampedX,
                    y: clampedY,
                    w: clampedW,
                    h: Math.max(2, clampedH),
                    minW: 2,
                    minH: 2
                }
            })
            updateLayout(newLayout)
        }
    }, [items.length, layoutMode, updateLayout])

    // Handle layout changes - ONLY clamp boundaries, don't rearrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLayoutChange = useCallback((currentLayout: any) => {
        // In custom mode: preserve exact user positions, just clamp boundaries
        if (layoutMode === 'custom') {
            const validatedLayout = currentLayout.map((item: any) => {
                // Only clamp to grid boundaries, don't change position/size
                const clampedY = Math.max(0, Math.min(item.y, GRID_CONFIG.MAX_ROWS - item.h))
                const clampedH = Math.min(item.h, GRID_CONFIG.MAX_ROWS - clampedY)
                const clampedX = Math.max(0, Math.min(item.x, GRID_CONFIG.COLS - item.w))
                const clampedW = Math.min(item.w, GRID_CONFIG.COLS - clampedX)

                return {
                    ...item,
                    y: clampedY,
                    h: Math.max(2, clampedH),
                    x: clampedX,
                    w: Math.max(2, clampedW)
                }
            })
            updateLayout(validatedLayout)
            return
        }

        // For auto/spotlight: validate but preserve the layout intent
        const validatedLayout = currentLayout.map((item: any) => {
            const clampedY = Math.max(0, Math.min(item.y, GRID_CONFIG.MAX_ROWS - item.h))
            const clampedH = Math.min(item.h, GRID_CONFIG.MAX_ROWS - clampedY)
            const clampedX = Math.max(0, Math.min(item.x, GRID_CONFIG.COLS - item.w))
            const clampedW = Math.min(item.w, GRID_CONFIG.COLS - clampedX)

            return {
                ...item,
                y: clampedY,
                h: Math.max(2, clampedH),
                x: clampedX,
                w: Math.max(2, clampedW)
            }
        })
        updateLayout(validatedLayout)
    }, [layoutMode, updateLayout])

    if (!mounted) return <div ref={containerRef} className="w-full h-full bg-transparent" />

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full p-4 transition-colors duration-500",
                !isLocked ? "bg-white/[0.01]" : null
            )}
            style={{ overflow: 'hidden' }}
        >
            <Responsive
                className="layout"
                layouts={layouts}
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={rowHeight}
                maxRows={GRID_CONFIG.MAX_ROWS}
                // @ts-expect-error - draggableHandle is supported but types are outdated
                draggableHandle=".drag-handle"
                resizeHandle={(axis: ResizeHandle, ref: React.Ref<HTMLElement>) => 
                    getResizeHandleElement(axis, ref)
                }
                onDragStart={() => setDragging(true)}
                onDragStop={() => setDragging(false)}
                onLayoutChange={onLayoutChange}
                margin={[10, 10]}
                useCSSTransforms={true}
                isDraggable={!isLocked}
                isResizable={!isLocked}
            >
                {items.map((item) => (
                    <div key={item.id} className="relative group">
                        <StreamWrapper item={item} />
                    </div>
                ))}
            </Responsive>
        </div>
    )
}

