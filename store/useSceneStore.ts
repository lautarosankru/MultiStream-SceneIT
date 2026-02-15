import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, parseStreamUrl } from '@/lib/utils'
import { StreamItem, StreamLayout, ItemType, StreamPlatform, LayoutMode } from '@/types/scene'
import { KickUser } from '@/types/kick'

interface SceneState {
    items: StreamItem[];
    isLocked: boolean;
    isDragging: boolean;
    backgroundId: string;

    // Layout Mode State
    layoutMode: LayoutMode;
    mainStreamId: string | null;

    // Chat State
    activeChatId: string | null;
    isSidebarOpen: boolean;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;

    // Actions
    addItem: (url: string, type?: ItemType) => void;
    removeItem: (id: string) => void;
    updateLayout: (layout: StreamLayout[]) => void;
    toggleMute: (id: string) => void;
    toggleLock: () => void;
    setDragging: (isDragging: boolean) => void;
    setItems: (items: StreamItem[]) => void;
    autoLayout: () => void;

    // Layout Mode Actions
    setLayoutMode: (mode: LayoutMode) => void;
    setMainStream: (id: string | null) => void;
    spotlightLayout: () => void;

    // Chat Actions
    setActiveChat: (id: string | null) => void;
    toggleSidebar: () => void;

    // Kick Auth State
    kickUser: KickUser | null;
    setKickUser: (user: KickUser | null) => void;
}


export const useSceneStore = create<SceneState>()(
    persist(
        (set, get) => ({
            items: [],
            isLocked: false,
            isDragging: false,
            backgroundId: 'default',
            activeChatId: null,
            isSidebarOpen: true,
            sidebarWidth: 384,

            // Layout Mode State
            layoutMode: 'auto',
            mainStreamId: null,

            addItem: (url: string, type: ItemType = 'video') => {
                const { platform, sourceId } = parseStreamUrl(url)
                const id = generateId()

                // Calculamos posición inicial basada en items existentes
                const currentItems = get().items
                const y = currentItems.length > 0
                    ? Math.max(...currentItems.map(i => i.layout.y + i.layout.h))
                    : 0

                const newItem: StreamItem = {
                    id,
                    type,
                    platform,
                    sourceId,
                    isMuted: false,
                    layout: {
                        i: id,
                        x: 0,
                        y: y + 9 > 24 ? 0 : y, // Si excede el alto, lo ponemos arriba (el grid lo empujará si hay colisión)
                        w: 4, // ancho default (grid de 12 columnas)
                        h: 9, // altura default para video 16:9 aprox en grid
                        minW: 2,
                        minH: 2,
                    }
                }

                set((state) => ({
                    items: [...state.items, newItem],
                    activeChatId: id // Auto-select chat for new item
                }))
            },

            removeItem: (id: string) => {
                set((state) => {
                    const newItems = state.items.filter((i) => i.id !== id)
                    // If removing active chat, select another one or null
                    const newActiveChatId = state.activeChatId === id
                        ? (newItems.length > 0 ? newItems[0].id : null)
                        : state.activeChatId

                    return { items: newItems, activeChatId: newActiveChatId }
                })
            },

            updateLayout: (newLayout: StreamLayout[]) => {
                set((state) => ({
                    items: state.items.map(item => {
                        const layoutItem = newLayout.find(l => l.i === item.id)
                        if (layoutItem) {
                            return {
                                ...item,
                                layout: {
                                    ...item.layout,
                                    x: layoutItem.x,
                                    y: layoutItem.y,
                                    w: layoutItem.w,
                                    h: layoutItem.h
                                }
                            }
                        }
                        return item
                    })
                }))
            },

            toggleMute: (id: string) => {
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, isMuted: !i.isMuted } : i
                    ),
                }))
            },

            toggleLock: () => {
                set((state) => ({ isLocked: !state.isLocked }))
            },

            setDragging: (isDragging: boolean) => {
                set({ isDragging })
            },

            setItems: (items: StreamItem[]) => {
                set({ items })
            },

            autoLayout: () => {
                const items = get().items
                if (items.length === 0) return

                const COLS = 12
                const TOTAL_ROWS = 24
                let w = 12
                let h = 24

                if (items.length === 1) {
                    w = 12;
                    h = TOTAL_ROWS;
                } else if (items.length === 2) {
                    w = 6;
                    h = TOTAL_ROWS;
                } else if (items.length <= 4) {
                    w = 6;
                    h = TOTAL_ROWS / 2;
                } else if (items.length <= 6) {
                    w = 4;
                    h = TOTAL_ROWS / 2;
                } else if (items.length <= 9) {
                    w = 4;
                    h = TOTAL_ROWS / 3;
                } else {
                    w = 3;
                    h = TOTAL_ROWS / 3;
                }

                const newItems = items.map((item, index) => {
                    const row = Math.floor(index / (COLS / w))
                    const col = index % (COLS / w)

                    const finalY = row * h;
                    // Clamp h if it would exceed TOTAL_ROWS
                    const finalH = (finalY + h > TOTAL_ROWS) ? (TOTAL_ROWS - finalY) : h;

                    return {
                        ...item,
                        layout: {
                            ...item.layout,
                            x: col * w,
                            y: finalY,
                            w,
                            h: Math.max(2, finalH)
                        }
                    }
                })

                set({ items: newItems })
            },


            setActiveChat: (id: string | null) => {
                set({ activeChatId: id, isSidebarOpen: true })
            },

            toggleSidebar: () => {
                set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
            },

            setSidebarWidth: (width: number) => {
                set({ sidebarWidth: width })
            },

            // Layout Mode Actions
            setLayoutMode: (mode: LayoutMode) => {
                set({ layoutMode: mode })
                // If switching to spotlight, ensure we have a main stream
                if (mode === 'spotlight') {
                    const { mainStreamId, items } = get()
                    if (!mainStreamId && items.length > 0) {
                        set({ mainStreamId: items[0].id })
                    }
                }
            },

            setMainStream: (id: string | null) => {
                const { items, layoutMode } = get()
                // Verify the id exists in items
                if (id && !items.find(i => i.id === id)) {
                    return
                }
                set({ mainStreamId: id })
                // Auto-switch to spotlight mode if setting a main stream
                if (id && layoutMode !== 'spotlight') {
                    set({ layoutMode: 'spotlight' })
                }
            },

            spotlightLayout: () => {
                const items = get().items
                if (items.length === 0) return

                const { mainStreamId } = get()
                const COLS = 12
                const TOTAL_ROWS = 24

                // Determine main stream: use mainStreamId or default to first item
                const mainId = mainStreamId || items[0].id
                const mainItemIndex = items.findIndex(i => i.id === mainId)
                
                // If mainStreamId doesn't exist in items, reset to first item
                const actualMainIndex = mainItemIndex === -1 ? 0 : mainItemIndex
                const actualMainId = items[actualMainIndex].id

                // Update mainStreamId to the actual one we're using
                set({ mainStreamId: actualMainId, layoutMode: 'spotlight' })

                // If only 1 item, full screen
                if (items.length === 1) {
                    const newItems = items.map((item, index) => ({
                        ...item,
                        layout: {
                            ...item.layout,
                            x: 0,
                            y: 0,
                            w: 12,
                            h: TOTAL_ROWS
                        }
                    }))
                    set({ items: newItems })
                    return
                }

                // Calculate number of secondary items
                const secondaryCount = items.length - 1

                // Main stream: 60% of height (14 rows)
                const MAIN_H = Math.round(TOTAL_ROWS * 0.6) // 14
                
                // Secondary height: remaining 40% (10 rows)
                const SEC_H = TOTAL_ROWS - MAIN_H // 10
                
                // Secondary width: divide 12 cols evenly among all secondary items
                const SEC_W = Math.floor(COLS / secondaryCount)
                
                // Get all secondary items in original order
                const secondaryItems = items.filter(i => i.id !== actualMainId)
                
                const newItems = items.map((item) => {
                    const isMain = item.id === actualMainId

                    if (isMain) {
                        return {
                            ...item,
                            layout: {
                                ...item.layout,
                                x: 0,
                                y: 0,
                                w: COLS,
                                h: MAIN_H
                            }
                        }
                    }

                    // Secondary items: all in one row below main, distributed horizontally
                    const secIndex = secondaryItems.findIndex(i => i.id === item.id)

                    return {
                        ...item,
                        layout: {
                            ...item.layout,
                            x: secIndex * SEC_W,
                            y: MAIN_H,
                            w: SEC_W,
                            h: SEC_H
                        }
                    }
                })

                set({ items: newItems })
            },

            kickUser: null,
            setKickUser: (user: KickUser | null) => set({ kickUser: user }),
        }),
        {
            name: 'scene-storage',
            partialize: (state) => ({ 
                items: state.items, 
                layoutMode: state.layoutMode,
                mainStreamId: state.mainStreamId,
                backgroundId: state.backgroundId,
                isLocked: state.isLocked,
                sidebarWidth: state.sidebarWidth,
            }),
        }
    )
)

