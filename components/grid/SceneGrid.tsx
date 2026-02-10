import { useMemo, useCallback } from "react"
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

    if (!mounted) return <div ref={containerRef} className="w-full min-h-screen bg-transparent" />

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full min-h-screen p-4 pb-20 transition-colors duration-200",
                !isLocked && "bg-white/[0.02]"
            )}
        >
            <Responsive
                className="layout"
                layouts={layouts}
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                // @ts-expect-error - draggableHandle is supported but types are missing it in ResponsiveProps
                draggableHandle=".drag-handle"
                resizeHandle={(axis: any, ref: React.Ref<HTMLElement>) => (
                    <span
                        ref={ref}
                        className={cn(
                            `react-resizable-handle react-resizable-handle-${axis} z-50`,
                            "flex items-end justify-end p-1 cursor-se-resize"
                        )}
                    >
                        {/* Only show visual indicator in Edit Mode */}
                        {!isLocked && (
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity" />
                        )}
                    </span>
                )}
                onDragStart={() => setDragging(true)}
                onDragStop={() => setDragging(false)}
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
