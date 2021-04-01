/**
 * Guilded's custom reaction object
 */
export interface CustomReaction {
    id: number;
    name: string;
    png: string | null;
    webp: string | null;
    apng: string | null;
}