import { Permissions } from "./others.ts";
import { Document } from "./content.ts";

/**
 * Guilded's role object structure
 */
export interface Role{
    id: number;
    name: string;
    color: string;
    priority: number;
    permissions: Permissions;
    isBase: boolean;
    teamId: string;
    createdAt: string;
    updatedAt: string;
    isMentionable: boolean;
    discordRoleId: string | null | number;
    discordSyncedAt: string | null | number;
    isSelfAssignable: boolean;
    isDisplayedSeparately: boolean;
}

/**
 * Guilded's group object
 */
export interface Group{
    id: string;
    name: string;
    description: string | null;
    priority: number;
    type: string;
    avatar: string | null;
    banner: string | null;
    teamId: string | null;
    gameId: string | null;
    visibilityTeamRoleId: string | null;
    visibilityTeamRoleIds?: number[];
    additionalVisibilityTeamRoleIds?: number[];
    membershipTeamRoleId?: number;
    membershipTeamRoleIds?: number[];
    additionalMembershipTeamRoleIds?: number[];
    isBase: boolean;
    additionalGameInfo: Record<string, unknown>;
    createdBy: string | null;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    customReactionId: string | null;
    isPublic: boolean;
    archivedAt: string | null;
    archivedBy: string | boolean;
    membershipUpdates?: unknown[];
}

/**
 * Team bot structure
 */
export interface Bot{
    id: string;
    name: string;
    enabled: boolean;
    teamId: string;
    iconUrl: string;
    createdBy: string;
    createdAt: string;
    deletedAt: string | null;
    flows: {
        id: string;
        enabled: boolean;
        error: boolean;
        botId: string;
        teamId: string;
        createdAt: string;
        createdBy: string;
        deletedAt: string | null;
        triggerType: string;
        triggerMeta: Record<string, string>;
        actionType: string;
        actionMeta: Record<'content', Document>;
    }[]
}

/**
 * Upshell object structure
 */
export interface Upshell{
    type: string;
    activationType: string;
    topic: string;
    isAE: boolean;
    includedUpshellSpecs: boolean | null;
    entityId: string;
    includedUpshells: unknown[];
    createdAtUnixSecs: string;
    localStageStats: {
        inviteOthersToServer: string;
        sendMessage: string;
        openChannelSwitcher: string;
        createGroup: string;
        createChannel: string;
        postAnnouncement: string;
    }
}

/**
 * The short team member object structure
 */
export interface CompactTeamMember{
    name: string;
    id: string;
    profilePicture?: string;
    roleIds?: string[];
    userPresenceStatus: 0 | 1 | 2 | 3;
}

/**
 * Ban object structure
 */
export interface Ban{
    reason: string;
    userId: string;
    bannedBy: string;
    createdAt: string;
}

/**
 * Delete history options
 */
export type DeleteHistoryOptions = -1 | 0 | 1;

/**
 * Ban member options
 */
export interface BanOptions{
    deleteHistoryOptions?: DeleteHistoryOptions;
    reason?: string;
    afterDate?: string | number;
    memberId: string;
    teamId: string;
}

/**
 * Create role options structure
 */
export interface CreateRoleOptions{
    name?: string;
    permissions?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
}

/**
 * Emoji object structure
 */
export interface Emoji{
    id: number;
    name: string;
    webp: string;
    png: string;
    apng: string;
    aliases: Record<string, unknown>;
    createdAt: string;
    createdBy: string;
    teamId: string;
    isDeleted: boolean;
    discordEmojiId: string | number | null;
    discordSyncedAt: string | number | null;
}

/**
 * Get emoji options
 */
export interface GetEmojiOptions{
    maxItems?: number;
    when?: Record<'upperValue' | 'lowerValue', string | number>;
    createdBy?: string;
    searchTerm?: string;
    beforeId?: string;
}

/**
 * Create emoji options object structure
 */
export interface CreateEmojiOptions{
    name: string;
    png?: string;
    webp?: string;
    apng?: string;
}