/**
 * Guilded api's device object
 */
export interface Device {
    type: string;
    id: string;
    lastOnline: string;
    isActive: boolean;
}

/**
 * Guilded Permissions Object structure
 */
export interface Permissions{
    xp: number;
    chat: number;
    bots?: number;
    docs: number;
    forms: number;
    lists: number;
    media: number;
    voice: number;
    forums: number;
    general: number;
    streams: number;
    brackets?: number;
    calendar: number;
    scheduling: number;
    matchmaking: number;
    recruitment: number;
    announcements: number;
    customization: number;
}

/**
 * The hello type payload sent by the guilded gateway api
 */
export interface HelloTypePayload{
    sid: string;
    upgrades: Record<string, unknown>;
    pingInterval: number;
    pingTimeout: number;
}

/**
 * Webhook object structure
 */
export interface Webhook{
    id: string;
    name: string;
    channelId: string;
    teamId: string;
    iconUrl: string;
    createdBy: string;
    createdAt: string;
    deletedAt: string | null;
    token?: string;
}

/**
 * UnfUrl Embed object
 */
export interface UnfURLEmbed{
    ogTitle: string;
    ogDescription: string;
    ogSiteName: string;
    ogUrl: string;
    ogImage: Record<'url', string>;
    siteType: string;
}