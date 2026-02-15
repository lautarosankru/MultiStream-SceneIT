import type { Layout } from "react-grid-layout"

// Re-export or define local to avoid RGL issues if needed, but if we just use defining props it's fine.
// Actually, let's use the local definition to be safe as we did in useSceneStore
export interface StreamLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
}

export type LayoutMode = 'auto' | 'spotlight' | 'custom';

export type ItemType = 'video' | 'chat';
export type StreamPlatform = 'twitch' | 'kick' | 'youtube' | 'custom';

export interface StreamItem {
    id: string; // UUID v4
    type: ItemType;
    platform: StreamPlatform;
    sourceId: string; // channel name (Twitch/Kick) or VideoID (YT)
    isMuted: boolean;
    layout: StreamLayout;
}
