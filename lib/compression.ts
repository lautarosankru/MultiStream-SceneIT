import LZString from 'lz-string';
import { StreamItem } from '@/types/scene';

export function compressLayout(items: StreamItem[]): string {
    try {
        const json = JSON.stringify(items);
        return LZString.compressToEncodedURIComponent(json);
    } catch (error) {
        console.error("Error compressing layout:", error);
        return "";
    }
}

export function decompressLayout(compressed: string): StreamItem[] {
    try {
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (!json) return [];
        return JSON.parse(json);
    } catch (error) {
        console.error("Error decompressing layout:", error);
        return [];
    }
}
