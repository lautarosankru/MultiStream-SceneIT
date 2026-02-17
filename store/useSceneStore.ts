import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, parseStreamUrl } from '@/lib/utils'
import { StreamItem, StreamLayout, ItemType, LayoutMode } from '@/types/scene'
import { GRID_CONFIG, DEFAULT_SIDEBAR_WIDTH, MAIN_STREAM_HEIGHT_RATIO } from '@/lib/config/grid'
import { clampLayoutItems } from '@/lib/layout-utils'

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
    chatSidebarWidth: number;
    setChatSidebarWidth: (width: number) => void;

    // Actions
    addItem: (url: string, type?: ItemType) => void;
    removeItem: (id: string) => void;
    updateLayout: (layout: StreamLayout[]) => void;

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
            chatSidebarWidth: DEFAULT_SIDEBAR_WIDTH,

            // Layout Mode State
            layoutMode: 'auto',
            mainStreamId: null,

            addItem: (url: string, type: ItemType = 'video') => {
                const { platform, sourceId } = parseStreamUrl(url)
                const id = generateId()

                // Always add item with default layout - autoLayout will reposition it
                const newItem: StreamItem = {
                    id,
                    type,
                    platform,
                    sourceId,

                    layout: {
                        i: id,
                        x: 0,
                        y: 0,
                        w: 4,
                        h: 9,
                        minW: 2,
                        minH: 2,
                    }
                }

                set((state) => ({
                    items: [...state.items, newItem],
                    activeChatId: id,
                    isSidebarOpen: true
                }))

                // Apply layout based on current mode
                const currentMode = get().layoutMode
                if (currentMode === 'auto') {
                    get().autoLayout()
                } else if (currentMode === 'spotlight') {
                    get().spotlightLayout()
                }
                // 'custom' mode doesn't auto-arrange
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
                set((state) => {
                    // Apply new layout positions
                    const updatedItems = state.items.map(item => {
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

                    // Apply universal clamping rules to all items
                    const clampedItems = clampLayoutItems(updatedItems)

                    return { items: clampedItems }
                })
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
                const count = items.length

                let cols: number, rows: number

                if (count === 1) {
                    cols = 1; rows = 1
                } else if (count === 2) {
                    cols = 2; rows = 1
                } else if (count <= 4) {
                    cols = 2; rows = 2
                } else if (count <= 6) {
                    cols = 3; rows = 2
                } else if (count <= 9) {
                    cols = 3; rows = 3
                } else if (count <= 12) {
                    cols = 4; rows = 3
                } else if (count <= 16) {
                    cols = 4; rows = 4
                } else {
                    cols = Math.ceil(Math.sqrt(count * 1.5))
                    rows = Math.ceil(count / cols)
                }

                // Use full grid - TOTAL_ROWS
                const itemWidth = Math.floor(COLS / cols)
                const itemHeight = Math.floor(TOTAL_ROWS / rows)

                const newItems = items.map((item, index) => {
                    const row = Math.floor(index / cols)
                    const col = index % cols

                    const x = col * itemWidth
                    const y = row * itemHeight

                    // Ensure items don't exceed grid boundaries
                    const w = Math.min(itemWidth, COLS - x)
                    const h = Math.min(itemHeight, TOTAL_ROWS - y)

                    return {
                        ...item,
                        layout: {
                            ...item.layout,
                            x,
                            y,
                            w: Math.max(2, w),
                            h: Math.max(2, h),
                            minW: 2,
                            minH: 2
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

            setChatSidebarWidth: (width: number) => {
                set({ chatSidebarWidth: width })
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
                    get().spotlightLayout()
                } else if (mode === 'auto') {
                    get().autoLayout()
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
                    const newItems = items.map((item) => ({
                        ...item,
                        layout: {
                            ...item.layout,
                            x: 0,
                            y: 0,
                            w: COLS,
                            h: TOTAL_ROWS,
                            minW: 2,
                            minH: 2
                        }
                    }))
                    set({ items: newItems })
                    return
                }

                // Calculate number of secondary items
                const secondaryCount = items.length - 1

                // Main stream: 65% of height for better visibility
                const MAIN_H = Math.floor(TOTAL_ROWS * MAIN_STREAM_HEIGHT_RATIO)

                // Secondary height: remaining space
                const SEC_H = TOTAL_ROWS - MAIN_H

                // Calculate secondary layout - fit in one or two rows if needed
                let secondaryCols = secondaryCount
                let secondaryRows = 1

                // If too many secondary items for one row, use multiple rows
                if (secondaryCount > 6) {
                    secondaryCols = Math.ceil(Math.sqrt(secondaryCount))
                    secondaryRows = Math.ceil(secondaryCount / secondaryCols)
                }

                // Secondary width: divide cols evenly
                const SEC_W = Math.floor(COLS / secondaryCols)
                const SEC_ROW_H = Math.floor(SEC_H / secondaryRows)

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
                                h: MAIN_H,
                                minW: 2,
                                minH: 2
                            }
                        }
                    }

                    // Secondary item
                    const secIndex = secondaryItems.findIndex(s => s.id === item.id)
                    const secRow = Math.floor(secIndex / secondaryCols)
                    const secCol = secIndex % secondaryCols

                    const x = secCol * SEC_W
                    const y = MAIN_H + (secRow * SEC_ROW_H)
                    const w = Math.min(SEC_W, COLS - x)
                    const h = Math.min(SEC_ROW_H, TOTAL_ROWS - y)

                    return {
                        ...item,
                        layout: {
                            ...item.layout,
                            x,
                            y,
                            w: Math.max(2, w),
                            h: Math.max(2, h),
                            minW: 2,
                            minH: 2
                        }
                    }
                })

                set({ items: newItems })
            },
        }),
        {
            name: 'scene-storage',
            partialize: (state) => ({
                items: state.items,
                layoutMode: state.layoutMode,
                mainStreamId: state.mainStreamId,
                backgroundId: state.backgroundId,
                isLocked: state.isLocked,
                chatSidebarWidth: state.chatSidebarWidth,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return

                if (typeof window !== 'undefined') {
                    const maxAllowed = window.innerWidth * 0.5
                    const MAX_SIDEBAR_WIDTH = 800
                    const currentWidth = state.chatSidebarWidth
                    if (currentWidth > maxAllowed || currentWidth > MAX_SIDEBAR_WIDTH) {
                        const newWidth = Math.min(MAX_SIDEBAR_WIDTH, maxAllowed)
                        state.setChatSidebarWidth(newWidth)
                    }
                }
            }
        }
    )
)

