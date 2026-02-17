import LZString from 'lz-string';
import { StreamItem } from '@/types/scene';

export function compressLayout(items: StreamItem[]): string {
    try {
        if (!Array.isArray(items)) {
            console.error('[compression] Invalid items: not an array');
            return '';
        }
        const json = JSON.stringify(items);
        const compressed = LZString.compressToEncodedURIComponent(json);
        if (!compressed) {
            console.error('[compression] Compression failed');
            return '';
        }
        return compressed;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[compression] Error compressing layout:', errorMessage);
        return '';
    }
}

export function decompressLayout(compressed: string): StreamItem[] {
    try {
        if (!compressed || typeof compressed !== 'string') {
            console.error('[compression] Invalid compressed data');
            return [];
        }
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (!json) {
            console.error('[compression] Decompression failed');
            return [];
        }
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
            console.error('[compression] Decompressed data is not an array');
            return [];
        }
        return parsed;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[compression] Error decompressing layout:', errorMessage);
        return [];
    }
}
