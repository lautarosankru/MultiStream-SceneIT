import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, parseStreamUrl } from '@/lib/utils'
import { StreamItem, StreamLayout, ItemType, StreamPlatform } from '@/types/scene'
import { KickUser } from '@/types/kick'

interface SceneState {
    items: StreamItem[];
    isLocked: boolean; // Replaces isEditMode. If true: "Cinema Mode" (no controls). If false: "Edit Mode" (grid, handles).
    isDragging: boolean; // Para activar overlay en iframes
    backgroundId: string; // Para personalización futura

    // Chat State
    activeChatId: string | null;
    isSidebarOpen: boolean;

    // Actions
    addItem: (url: string, type?: ItemType) => void;
    removeItem: (id: string) => void;
    updateLayout: (layout: StreamLayout[]) => void;
    toggleMute: (id: string) => void;
    toggleLock: () => void; // Replaces toggleEditMode
    setDragging: (isDragging: boolean) => void;
    setItems: (items: StreamItem[]) => void;
    autoLayout: () => void;

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
            isLocked: false, // Default to unlocked (Edit Mode) so users can arrange first
            isDragging: false,
            backgroundId: 'default',
            activeChatId: null,
            isSidebarOpen: true,

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

            kickUser: null,
            setKickUser: (user: KickUser | null) => set({ kickUser: user }),
        }),
        {
            name: 'scene-storage',
            // partialize: (state) => ({ items: state.items, backgroundId: state.backgroundId }), // Optional: persist specific fields
        }
    )
)

