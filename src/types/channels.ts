// deno-lint-ignore-file camelcase

/**
 * Guilded channel types
 */
export type ChannelTypes = 'Team' | 'DM';

/**
 * Channel content types
 */
export type ChannelContentTypes = 'chat' | 'voice' | 'forum' | 'doc';

/**
 * Create channel options
 */
export interface CreateChannel{
    name?: string;
    contentType?: ChannelContentTypes;
    channelCategoryId?: string;
    isPublic?: boolean;
}

/**
 * Modify channel options
 */
export interface ModifyChannel{
    name?: string;
    type?: number;
    description?: string;
    position?: number;
    topic?: string;
    nsfw?: boolean;
    isPublic?: boolean;
    rate_limit_per_user?: number;
    bitrate?: number;
    user_limit?: number;
    parent_id?: number;
}