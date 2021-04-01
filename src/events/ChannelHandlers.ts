// deno-lint-ignore-file no-explicit-any

import type Client from "../Client.ts";

export function CHANNEL_SEEN(client: Client, payload: any) {
    client.emit('channelSeen', {
        channel: {
            id: payload.channelId,
            contentType: payload.contentType
        },
        teamId: payload.teamId,
        clearAllBadges: payload.clearAllBadges,
        guildedClientId: payload.guildedClientId
    });
}

export function USER_TEAM_SECTION_SEEN(client: Client, payload: any) {
    client.emit('teamSectionSeen', {
        itemId: payload.itemId,
        teamId: payload.teamId,
        guildedClientId: payload.guildedClientId
    })
}

export function ChatChannelTyping(client: Client, payload: any) {
    client.emit('typing', payload.userId, payload.channelId);
}