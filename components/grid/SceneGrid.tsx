import { useMemo, useCallback, useState, useEffect } from "react"
// @ts-ignore - definitions are missing named exports but they exist at runtime in ESM build
import { Responsive, useContainerWidth } from "react-grid-layout"
import { useSceneStore } from "@/store/useSceneStore"
import { StreamWrapper } from "@/components/stream/StreamWrapper"
import { cn } from "@/lib/utils"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

export function SceneGrid() {
    const { items, updateLayout, isLocked, setDragging, layoutMode, mainStreamId, spotlightLayout, autoLayout } = useSceneStore()
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

    // Calculate rowHeight to fit a fixed number of rows (e.g., 20) in the viewport
    // containerHeight - padding (32px) - margins (19 * 10px) / 20 rows
    const BASE_ROWS = 24;
    const MARGIN_Y = 10;
    const PADDING_Y = 32; // p-4 = 16px * 2

    // Calculate dynamic maxRows based on spotlight layout
    // In spotlight mode with many secondary items, we may need more than 24 rows
    const maxRows = useMemo(() => {
        if (items.length === 0) {
            return BASE_ROWS;
        }
        
        // Calculate the max Y + H from all items
        const maxYH = items.reduce((max, item) => {
            const itemBottom = item.layout.y + item.layout.h;
            return Math.max(max, itemBottom);
        }, 0);
        
        // Add some buffer and ensure minimum of BASE_ROWS
        return Math.max(BASE_ROWS, maxYH);
    }, [items]);

    // rowHeight is calculated to fit BASE_ROWS (24) in the container
    // This ensures consistent sizing regardless of actual maxRows
    const rowHeight = useMemo(() => {
        if (!containerHeight) return 30;
        const availableHeight = containerHeight - PADDING_Y - ((BASE_ROWS - 1) * MARGIN_Y);
        return Math.floor(availableHeight / BASE_ROWS);
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
    }, [items, isLocked, layoutMode, mainStreamId])

    // Checking changes to layout store
    const onLayoutChange = useCallback((currentLayout: any, _allLayouts: any) => {
        // Only update if not locked
        if (!isLocked) {
            // Ensure data integrity before saving to store
            // Use maxRows for validation to allow spotlight layouts with more rows
            const validatedLayout = currentLayout.map((item: any) => ({
                ...item,
                y: Math.min(item.y, maxRows - item.h),
                h: Math.min(item.h, maxRows - item.y)
            }));
            updateLayout(validatedLayout)
        }
    }, [isLocked, updateLayout, maxRows])

    if (!mounted) return <div ref={containerRef} className="w-full h-full bg-transparent" />

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full p-4 transition-colors duration-500",
                !isLocked ? "bg-white/[0.01]" : null
            )}
            style={{ overflowY: maxRows > BASE_ROWS ? 'auto' : 'hidden' }}
        >
            <Responsive
                className="layout"
                layouts={layouts}
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={rowHeight}
                maxRows={maxRows}
                // @ts-expect-error - draggableHandle is supported but types are missing it in ResponsiveProps
                draggableHandle=".drag-handle"
                resizeHandle={(axis: any, ref: React.Ref<HTMLElement>) => (
                    <div
                        ref={ref as any}
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
                    // h = (realH + MARGIN) / (rowHeight + MARGIN)
                    const idealH = Math.round((idealRealH + MARGIN) / (rowHeight + MARGIN));

                    // CLAMP: Don't let it exceed maxRows - current Y
                    const maxAvailableH = maxRows - newItem.y;
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

