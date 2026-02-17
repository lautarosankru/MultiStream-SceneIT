import { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout"
import { useSceneStore } from "@/store/useSceneStore"
import { StreamWrapper } from "@/components/stream/StreamWrapper"
import { cn } from "@/lib/utils"
import { GRID_CONFIG } from "@/lib/config/grid"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

type ResizeHandle = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

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
        // If in spotlight mode, recalculate layout
        if (layoutMode === 'spotlight') {
            return {
                lg: items.map(item => ({
                    ...item.layout,
                    i: item.id,
                    static: isLocked
                }))
            }
        }
        
        // Auto mode: use the stored layout from items
        return {
            lg: items.map(item => ({
                ...item.layout,
                i: item.id,
                static: isLocked // Standard RGL way to lock items
            }))
        }
    }, [items, isLocked, layoutMode])

    // Validate layout only when items are added/removed
    // Don't interfere with manual resize in custom mode
    const itemsCountRef = useRef(items.length)
    const layoutModeRef = useRef(layoutMode)
    
    useEffect(() => {
        if (items.length === 0) return

        // Only trigger if item count changed (add/remove)
        if (itemsCountRef.current === items.length && layoutModeRef.current === layoutMode) {
            return
        }
        
        itemsCountRef.current = items.length
        layoutModeRef.current = layoutMode

        const hasInvalidItems = items.some(item => {
            const { x, y, w, h } = item.layout
            return y + h > GRID_CONFIG.MAX_ROWS || x + w > GRID_CONFIG.COLS
        })

        if (hasInvalidItems && layoutMode !== 'custom') {
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
    }, [items.length, layoutMode])

    // Handle layout changes - clamp only the item being resized, not all items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLayoutChange = useCallback((currentLayout: any) => {
        // Only validate items that are being actively dragged/resized
        // We check which item has changed and clamp just that one
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validatedLayout = currentLayout.map((item: any) => {
            // Clamp to grid boundaries
            const maxY = GRID_CONFIG.MAX_ROWS - item.h
            const clampedY = Math.max(0, Math.min(item.y, maxY))
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
    }, [updateLayout])

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
                resizeHandle={(axis: ResizeHandle, ref: React.Ref<HTMLElement>) => (
                    <div
                        ref={ref as React.Ref<HTMLDivElement>}
                        className={cn(
                            `react-resizable-handle react-resizable-handle-${axis} z-50`,
                            "absolute bottom-0 right-0 w-12 h-12 flex items-end justify-end cursor-se-resize touch-none",
                            "group"
                        )}
                    >
                        {!isLocked ? (
                            <div className="m-2 w-6 h-6 flex items-center justify-center glossy-btn rounded-full shadow-[0_0_15px_rgba(135,255,50,0.6)] group-hover:scale-110 group-active:scale-95 transition-all duration-300 border border-white/40">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3 h-3 text-white drop-shadow-md"
                                >
                                    <path d="M15 19l4-4M10 19l9-9" />
                                </svg>
                            </div>
                        ) : null}
                    </div>
                )}
                onDragStart={() => setDragging(true)}
                onDragStop={() => setDragging(false)}
                onResize={(layout, oldItem, newItem) => {
                    if (!newItem) return;

                    const MARGIN = 10;
                    const COLS = 12;
                    const colWidth = (width - (COLS - 1) * MARGIN) / COLS;

                    // Width in pixels: number of cols * colWidth + internal margins
                    const realW = newItem.w * colWidth + (newItem.w - 1) * MARGIN;

                    // Ideal height in pixels for 16:9
                    const idealRealH = realW * (9 / 16);

                    // Convert pixels back to grid rows (h)
                    const idealH = Math.round((idealRealH + MARGIN) / (rowHeight + MARGIN));

                    // STRICT CLAMP: Never exceed MAX_ROWS boundary
                    const maxAvailableH = GRID_CONFIG.MAX_ROWS - newItem.y;
                    newItem.h = Math.min(maxAvailableH, Math.max(newItem.minH ?? 2, idealH));
                }}
                onLayoutChange={onLayoutChange}
                margin={[10, 10]}
                useCSSTransforms={true}
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

