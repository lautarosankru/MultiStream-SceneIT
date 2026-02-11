import { useMemo, useCallback, useState, useEffect } from "react"
// @ts-ignore - definitions are missing named exports but they exist at runtime in ESM build
import { Responsive, useContainerWidth } from "react-grid-layout"
import { useSceneStore } from "@/store/useSceneStore"
import { StreamWrapper } from "@/components/stream/StreamWrapper"
import { cn } from "@/lib/utils"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

export function SceneGrid() {
    const { items, updateLayout, isLocked, setDragging } = useSceneStore()
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
    const TOTAL_ROWS = 24;
    const MARGIN_Y = 10;
    const PADDING_Y = 32; // p-4 = 16px * 2

    const rowHeight = useMemo(() => {
        if (!containerHeight) return 30;
        const availableHeight = containerHeight - PADDING_Y - ((TOTAL_ROWS - 1) * MARGIN_Y);
        return Math.floor(availableHeight / TOTAL_ROWS);
    }, [containerHeight]);

    // Memoize layout to prevent unnecessary re-renders
    const layouts = useMemo(() => ({
        lg: items.map(item => ({
            ...item.layout,
            i: item.id,
            static: isLocked // Standard RGL way to lock items
        }))
    }), [items, isLocked])

    // Checking changes to layout store
    const onLayoutChange = useCallback((currentLayout: any, _allLayouts: any) => {
        // Only update if not locked (though static items shouldn't move often)
        if (!isLocked) {
            updateLayout(currentLayout)
        }
    }, [isLocked, updateLayout])

    if (!mounted) return <div ref={containerRef} className="w-full h-full bg-transparent" />

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full p-4 transition-colors duration-200 overflow-hidden",
                !isLocked ? "bg-white/[0.02]" : null
            )}
        >
            <Responsive
                className="layout"
                layouts={layouts}
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={rowHeight}
                // @ts-expect-error - draggableHandle is supported but types are missing it in ResponsiveProps
                draggableHandle=".drag-handle"
                resizeHandle={(axis: any, ref: React.Ref<HTMLElement>) => (
                    <div
                        ref={ref as any}
                        className={cn(
                            `react-resizable-handle react-resizable-handle-${axis} z-50`,
                            "absolute bottom-0 right-0 w-10 h-10 flex items-end justify-end cursor-se-resize touch-none", // Huge hit area (40x40px)
                            "group"
                        )}
                    >
                        {!isLocked ? (
                            <div className="m-1 w-6 h-6 flex items-center justify-center bg-indigo-600 rounded-tl-xl rounded-br-sm shadow-[0_0_15px_rgba(79,70,229,0.4)] group-hover:w-7 group-hover:h-7 group-active:scale-90 transition-all duration-200">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3 h-3 text-white"
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

                    newItem.h = Math.max(newItem.minH ?? 2, idealH);
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

