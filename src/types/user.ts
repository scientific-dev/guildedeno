import { CustomReaction } from "./reaction.ts";
import { Content } from "./content.ts";

/**
 * Union of statuses!
 */
export type Statuses = 'online' | 'dnd' | 'offline' | 'idle';

/**
 * About info object structure for the current user
 */
export interface AboutInfo{
    bio: string;
    tagline: string;
}

/**
 * A object which represents and describes the status of the user
 */
export interface UserStatus {
    content: Content | null;
    customReactionId: number | null;
    customReaction?: CustomReaction;
}

/**
 * Aliase object for the current user
 */
export interface UserAlias {
    alias?: string;
    discriminator: null | string;
    name: string;
    createdAt?: string;
    userId?: string;
    gameId: number;
    socialLinkSource: SocialSources | null;
    additionalInfo: unknown;
    editedAt?: string;
    playerInfo: unknown;
}

/**
 * All the social link sources registered by the guilded
 */
export type SocialSources = 'bnet' | 'twitch' | 'twitter' | 'discord' | 'psn' | 'steam' | 'xbox' | 'youtube' | 'discord' | 'psn' | 'steam' | 'switch' | 'twitch' | 'twitter' | 'xbox' | 'youtube';

/**
 * Transient status of the user
 */
export interface TransientStatus{
    id: number;
    gameId?: number;
    type: 'gamepresence' | string;
    startedAt: string;
    guildedClientId: string;
}

/**
 * Object structure for the friend user.
 */
export interface Friend{
    userId: string;
    status: string;
    createdAt: string;
}