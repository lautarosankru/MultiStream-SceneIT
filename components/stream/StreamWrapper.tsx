import { memo } from "react"
import { useSceneStore } from "@/store/useSceneStore"
import { type StreamItem } from "@/types/scene"
import { cn } from "@/lib/utils"
import { TwitchEmbed } from "@/components/stream/embeds/TwitchEmbed"
import { YouTubeEmbed } from "@/components/stream/embeds/YouTubeEmbed"
import { KickEmbed } from "@/components/stream/embeds/KickEmbed"
import { CustomEmbed } from "@/components/stream/embeds/CustomEmbed"
import { StreamControls } from "./controls/StreamControls"
import { StreamOverlay } from "./controls/StreamOverlay"

interface StreamWrapperProps {
    item: StreamItem
    style?: React.CSSProperties
    className?: string
    onMouseDown?: React.MouseEventHandler
    onMouseUp?: React.MouseEventHandler
    onTouchEnd?: React.TouchEventHandler
}

export const StreamWrapper = memo(function StreamWrapper({ item, style, className, onMouseDown, onMouseUp, onTouchEnd, ...props }: StreamWrapperProps) {
    const { isLocked, isDragging, layoutMode, mainStreamId, setMainStream } = useSceneStore()

    const isMain = layoutMode === 'spotlight' && mainStreamId === item.id

    // Determine which embed to render
    const renderEmbed = () => {
        switch (item.platform) {
            case 'twitch':
                return <TwitchEmbed item={item} />
            case 'youtube':
                return <YouTubeEmbed item={item} />
            case 'kick':
                return <KickEmbed item={item} />
            case 'custom':
            default:
                return <CustomEmbed item={item} />
        }
    }

    return (
        <div
            style={style}
            className={cn(
                "relative w-full h-full overflow-hidden group bg-black transition-all duration-300",
                "rounded-[var(--radius)]",
                // Edit Mode: High visibility, pulsing border
                !isLocked && "ring-2 ring-primary border-primary animate-pulse",
                // View Mode: Clean border, no glow
                isLocked && "border border-white/10 hover:border-white/30",
                className
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            {/* Controls Layer */}
            <StreamControls item={item} />

            {/* MAIN Indicator for Spotlight Mode */}
            {layoutMode === 'spotlight' && (
                <div
                    className={cn(
                        "absolute top-2 left-2 z-50 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/10",
                        isMain
                            ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-100"
                            : "bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-amber-500/80 hover:text-white"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        setMainStream(item.id);
                    }}
                >
                    {isMain ? "★ MAIN" : "Set as main"}
                </div>
            )}

            {/* Interaction Blocking Overlay for Edit Mode */}
            <StreamOverlay isLocked={isLocked} isDragging={isDragging} />

            {/* Content Layer */}
            <div className="w-full h-full relative z-0 bg-black">
                {renderEmbed()}
            </div>
        </div>
    )
})

