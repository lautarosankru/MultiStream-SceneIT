import { StreamItem, StreamLayout } from '@/types/scene'
import { GRID_CONFIG } from '@/lib/config/grid'

/**
 * Clamps a single layout item to grid boundaries
 */
export function clampLayoutItem(layout: StreamLayout): StreamLayout {
  const { x, y, w, h } = layout
  
  const clampedY = Math.max(0, Math.min(y, GRID_CONFIG.MAX_ROWS - h))
  const clampedH = Math.min(h, GRID_CONFIG.MAX_ROWS - clampedY)
  const clampedX = Math.max(0, Math.min(x, GRID_CONFIG.COLS - w))
  const clampedW = Math.min(w, GRID_CONFIG.COLS - clampedX)

  return {
    ...layout,
    x: clampedX,
    y: clampedY,
    w: Math.max(GRID_CONFIG.MIN_W, clampedW),
    h: Math.max(GRID_CONFIG.MIN_H, clampedH)
  }
}

/**
 * Clamps multiple layout items to grid boundaries
 */
export function clampLayoutItems(items: StreamItem[]): StreamItem[] {
  return items.map(item => ({
    ...item,
    layout: clampLayoutItem(item.layout)
  }))
}

/**
 * Validates if a layout item is within grid boundaries
 */
export function isLayoutValid(layout: StreamLayout): boolean {
  const { x, y, w, h } = layout
  return (
    x >= 0 &&
    y >= 0 &&
    x + w <= GRID_CONFIG.COLS &&
    y + h <= GRID_CONFIG.MAX_ROWS &&
    w >= GRID_CONFIG.MIN_W &&
    h >= GRID_CONFIG.MIN_H
  )
}

/**
 * Checks if any items in the array have invalid layouts
 */
export function hasInvalidLayouts(items: StreamItem[]): boolean {
  return items.some(item => !isLayoutValid(item.layout))
}
