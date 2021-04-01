import { ChannelContentTypes } from "./channels.ts";

/**
 * Channel seen event object structure
 */
export interface ChannelSeen{
    channel: {
        id: string;
        contentType: ChannelContentTypes;
    }
    teamId: string;
    clearAllBadges: boolean;
    guildedClientId: string;
}

/**
 * Team section event object structure
 */
export interface TeamSectionSeen{
    itemId: string;
    teamId: string;
    guildedClientId: string;
}

/**
 * Message event 
 */