import type Team from "../structures/Team.ts";
import type Channel from "../structures/Channel.ts";
import type { Embed } from "../utils/Embed.ts";
import { NestedNode } from "./content.ts";
import { ChannelContentTypes } from "./channels.ts";
import { CustomReaction } from "./reaction.ts";

/**
 * The type for the guilded's message content to send
 */
export type MessageContent = Embed | string | NestedNode;

/**
 * Reaction object structure
 */
export interface Reaction{
    customReactionId: number;
    createdAt: string;
    users: {
        id: string | null;
        webhookId: string | null;
        botId: string | null;
    }[];
    customReaction: CustomReaction | null;
}

/**
 * Mention data
 */
export interface Mention{
    id: string | number;
    name: string;
    type: 'here' | 'everyone' | 'person' | 'bot' | 'webhook' | 'role';
    color: string;
    matcher: string;
    description?: string;
    nickname?: boolean;
}

/**
 * Post announcement options
 */
export interface PostAnnouncement{
    title: string;
    content: MessageContent | MessageContent[];
}

/**
 * Post team announcement options
 */
export interface PostTeamAnnouncement extends PostAnnouncement{
    dontSendNotifications?: boolean;
}

/**
 * Compacted deleted message object
 */
export interface DeletedMessage{
    readonly team: Team;
    readonly channel: Channel | {
        id: string;
        contentType: ChannelContentTypes
        categoryId: string | number;
        type: 'Team' | 'DM';
    };
    id: string;
    teamId: string;
    channelId: string;
}

export type { CustomReaction };