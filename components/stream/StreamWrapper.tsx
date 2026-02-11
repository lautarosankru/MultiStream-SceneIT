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
    const { isLocked, isDragging } = useSceneStore()

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
                "relative w-full h-full overflow-hidden group bg-black shadow-2xl transition-all duration-300",
                "glass rounded-[var(--radius)]",
                // Highlight border in edit mode with Frutiger Glow
                !isLocked && "ring-4 ring-primary/30 border-primary shadow-[0_0_40px_rgba(135,255,235,0.3)] animate-pulse",
                // Default state: Subtle liquid border
                isLocked && "border border-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                className
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            {/* Controls Layer */}
            <StreamControls item={item} />

            {/* Interaction Blocking Overlay for Edit Mode */}
            <StreamOverlay isLocked={isLocked} isDragging={isDragging} />

            {/* Content Layer */}
            <div className="w-full h-full relative z-0">
                {renderEmbed()}
            </div>
        </div>
    )
})

