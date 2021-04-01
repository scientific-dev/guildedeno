// deno-lint-ignore-file no-explicit-any ban-ts-comment

import type Client from "../Client.ts";
import Message from "../structures/Message.ts";
import { makeMessageContent } from "../utils/mod.ts";

export async function ChatMessageCreated(client: Client, payload: any) {

    // @ts-ignore
    if(client.options.cache.users) await client.users.get(payload.createdBy, false);
    // @ts-ignore
    if(client.options.cache.teams && payload.teamId) await client.teams.get(payload.teamId);

    if(payload.message.type == 'system') {
        const call = SystemMessages[payload.systemMessageInfo.type as keyof typeof SystemMessages];
        call?.(payload, client);
    }

    const message = new Message({
        webhookId: null,
        botId: null,
        isPinned: null,
        pinnedBy: null,
        reactions: [],
        editedAt: null,
        deletedAt: null,
        ...payload.message,
        channelId: payload.channelId,
        teamId: payload.teamId
    }, client);

    // @ts-ignore
    if(client.options.cache.messages) client.channels.cache.get(message.channelId)?.messages.set(message.id, message);
    client.emit('messageCreate', message, payload.guildedClientId);

}

export async function ChatMessageUpdated(client: Client, payload: any) {

    // @ts-ignore
    if(client.options.cache.teams) await client.teams.get(payload.teamId);
    // @ts-ignore
    if(client.options.cache.users) await client.users.get(payload.updatedBy);

    const { content, embeds, mentions, reactions } = makeMessageContent(payload.message.content.document.nodes);
    let message;
    let oldMessage;

    // @ts-ignore
    if(client.options.cache.messages){
        const channel = client.channels.cache.get(payload.channelId);
        message = channel?.messages.get(payload.contentId);
        oldMessage = message;

        if(message && channel){
            message.content = content;
            message.embeds = embeds;
            message.emojis = reactions;
            message.mentions = mentions;
            message.editedAt = payload.message.editedAt;
        } else message = new Message({
            webhookId: null,
            botId: null,
            isPinned: null,
            pinnedBy: null,
            reactions: [],
            deletedAt: null,
            ...payload.message,
            createdBy: payload.editedBy,
            channelId: payload.channelId,
            teamId: payload.teamId
        }, client);
    } else message = new Message({
        webhookId: null,
        botId: null,
        isPinned: null,
        pinnedBy: null,
        reactions: [],
        deletedAt: null,
        ...payload.message,
        createdBy: payload.updatedBy,
        channelId: payload.channelId,
        teamId: payload.teamId
    }, client);

    client.emit('messageUpdate', message, oldMessage, payload.guildedClientId)
    
}

export async function ChatMessageDeleted(client: Client, payload: any) {

    // @ts-ignore
    if(payload.channelType != 'DM' && client.options.cache.teams) await client.teams.get(payload.teamId);

    // @ts-ignore
    if(client.options.cache.messages){
        const channel = client.channels.cache.get(payload.channelId);
        if(channel){
            const msg = channel.messages.get(payload.message.id);
            if(msg){
                channel.messages.delete(payload.message.id);
                return client.emit('messageDelete', msg, payload.guildedClientId);
            }
        }
    }

    client.emit('messageDelete', {
        id: payload.message.id,
        teamId: payload.teamId,
        channelId: payload.channelId,
        get channel(){
            return client.channels.cache.get(payload.channelId) || {
                id: payload.channelId,
                contentType: payload.contentType,
                categoryId: payload.channelCategoryId,
                type: payload.channelType
            }
        },
        get team(){
            return client.teams.cache.get(payload.teamId)
        }
    }, payload.newLastMessage ? new Message(payload.newLastMessage, client) : undefined, payload.guildedClientId);

}

const SystemMessages = {
    'team-channel-created': async (payload: any, client: Client) => {
        client.emit(
            'channelCreate',
            client.cache.channels.get(payload.channelId) || payload.channelId,
            // @ts-ignore
            client.options.cache.users ? await client.users.get(payload.systemMessageInfo.createdBy) : null
        );
    },
    'channel-renamed': async (payload: any, client: Client) => {
        let channel;
        // @ts-ignore
        if(client.options.cache.channels) {
            channel = payload.teamId ? await client.channels.get(payload.teamId, payload.channelId) : client.cache.channels.get(payload.channelId);
            if(channel) channel.name = payload.systemMessageInfo.newName;
        }

        client.emit(
            'channelRename',
            {
                channel,
                newName: payload.systemMessageInfo.newName,
                oldName: payload.systemMessageInfo.oldName
            },
            // @ts-ignore
            client.options.cache.users ? await client.users.get(payload.systemMessageInfo.createdBy) : null
        )
    }
}