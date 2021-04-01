// deno-lint-ignore-file ban-ts-comment

import type Client from "../Client.ts";
import Channel from "../structures/Channel.ts";
import Message from "../structures/Message.ts";
import { Collection, createMessageId, resolveMessage } from "../utils/mod.ts";
import { MessageContent } from "../types/messages.ts";
import { ModifyChannel } from "../types/channels.ts";

/**
 * A class which manages all the channel api endpoints and the user cache
 */
export default class ChannelManager{

    /**
     * A class which manages all the channel api endpoints and the channel cache
     * 
     * @param client Your guilded client
     * @example const manager = new ChannelManager(client);
     */
    constructor(public client: Client){}

    /**
     * Returns the cache of the channels
     * @readonly
     */
    get cache() {
        return this.client.cache.channels;
    }

    /**
     * Get a channel
     * 
     * @param teamId The team id of the channel
     * @param channelId The main channel id
     * @example const channel = await client.channels.get('team_id', 'channel_id');
     */
    async get(teamId: string, channelId: string): Promise<Channel | null> {
        const channels = await this.client.teams.getChannels(teamId);
        return channels?.get(channelId) || null;
    }

    /**
     * Edit a channel
     * 
     * @param teamId The team id of the channel
     * @param groupId The group id of the channel
     * @param channelId The main channel id
     * @param options The changes you want to make
     * @example await client.channels.edit('team_id', 'group_id', 'channel_id', { name: 'Rename channel' });
     */
    async editChannel(teamId: string, groupId: string, channelId: string, options: ModifyChannel): Promise<void> {
        await this.client.api(`/teams/${teamId}/groups/${groupId}/channels/${channelId}/info`, {
            method: 'PUT',
            body: options
        })

        // @ts-ignore
        if(this.client.options.cache.channels){
            const channel = this.client.channels.cache.get(channelId);
            if(channel){
                if(options.name) channel.name = options.name;
                if(options.description) channel.description = options.description;
                if(options.isPublic && channel instanceof Channel) channel.isPublic = options.isPublic;
            }
        }
    }

    /**
     * Delete a channel of the team
     * 
     * @param teamId The guilded team id
     * @param groupId The group in which you want to delete the channel
     * @param channelId The channel id to delet
     * @example await client.channels.deleteChannel('team_id', 'group_id', 'channel_id');
     */
    async deleteChannel(teamId: string, groupId: string, channelId: string): Promise<void> {
        await this.client.api(`/teams/${teamId}/groups/${groupId}/channels/${channelId}`, { method: 'DELETE' })
        // @ts-ignore
        if(this.client.options.cache.channels) this.client.cache.channels.delete(channelId);
    }

    /**
     * Get all the messages of a channel
     * 
     * @param channelId The guilded channel id
     * @param force If true, will force fetch else will search for cache first
     * @example const message = await client.channels.getMessages('id');
     */
    async getMessages(channelId: string, force = !this.client.options.cache?.messages): Promise<Collection<string, Message> | null> {
        if(!force){
            const existing = this.cache.get(channelId)?.messages;
            if(existing) return existing;
        }

        const [{ messages }] = await this.client.api(`/channels/${channelId}/messages`);

        if(messages){
            const cache = new Collection<string, Message>();
            
            // @ts-ignore
            if(this.client.options.cache.messages){
                for(let i = 0; i < messages.length; i++) {
                    const message = new Message(messages[i], this.client);
                    cache.set(messages[i].id, message);
                    this.client.cache.messages.set(message.id, message);
                }
            } else for(let i = 0; i < messages.length; i++) cache.set(messages[i].id, new Message(messages[i], this.client));

            return cache;
        } else return null;
    }

    /**
     * Send a message to a channel!
     * 
     * @param channelId The channel id where you need to send
     * @param messages Messages to send
     * @example await client.channels.sendMessage('channel_id', 'hello!');
     */
    async sendMessage(channelId: string, ...messages: MessageContent[]): Promise<Message> {

        const content = resolveMessage(...messages);
        const messageId = createMessageId();

        const [{ message: { createdAt } }] = await this.client.api(`/channels/${channelId}/messages`, {
            method: 'POST',
            body: {
                confirmed: false,
                messageId,
                content
            }
        });

        const message = new Message({
            id: messageId,
            type: 'default',
            reactions: [],
            createdBy: this.client.user.id,
            createdAt,
            editedAt: null,
            deletedAt: null,
            channelId: channelId,
            webhookId: null,
            botId: null,
            isPinned: null,
            pinnedBy: null,
            content
        }, this.client);

        // @ts-ignore
        if(this.client.options.cache.messages) this.client.cache.messages.set(messageId, message);
        return message;

    }

    /**
     * Delete a message from a channel
     * 
     * @param channelId The id of the channel
     * @param messageId The id of the message to delete
     * @example await client.channels.delete('channel_id', 'message_id');
     */
    async deleteMessage(channelId: string, messageId: string): Promise<void> {
        await this.client.api(`/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' });
        this.client.cache.messages.delete(messageId);
    }

    /**
     * React to a message
     * 
     * @param channelId The guilded channel id
     * @param messageId The message id to react
     * @param reactionId The id of the reaction to add as reaction
     * @example await client.channels.addMessageReaction('channel_id', 'message_id', 1000);
     */
    async addMessageReation(channelId: string, messageId: string, reactionId: string | number): Promise<void> {
        await this.client.api(`/channels/${channelId}/messages/${messageId}/reactions/${reactionId}`, { method: 'POST' });
    }

    /**
     * Remove reaction from a message
     * 
     * @param channelId The guilded channel id
     * @param messageId The message id to remove reaction
     * @param reactionId The id of the reaction to remove
     * @example await client.channels.removeMessageReaction('channel_id', 'message_id', 1000);
     */
    async removeMessageReation(channelId: string, messageId: string, reactionId: string | number): Promise<void> {
        await this.client.api(`/channels/${channelId}/messages/${messageId}/reactions/${reactionId}`, { method: 'DELERE' });
    }

    /**
     * Get all the pinned messages of a channel
     * 
     * @param channelId The channel id to get messages
     * @example const messages = await client.channels.getPinnedMessages('channel_id');
     */
    async getPinnedMessages(channelId: string): Promise<Collection<string, Message> | null> {
        const [{ messages }] = await this.client.api(`/channels/${channelId}/pins`);
        if(!messages) return null;

        const res = new Collection<string, Message>();

        // @ts-ignore
        if(this.client.options.cache.messages){
            for(let i = 0; i < messages.length; i++){
                const message = new Message(messages[i], this.client);
                res.set(message.id, message);
                this.client.cache.messages.set(message.id, message)
            }
        } else {
            for(let i = 0; i < messages.length; i++){
                const message = new Message(messages[i], this.client);
                res.set(message.id, message);
            }
        }

        return res;
    } 

    /**
     * Pin a message
     * 
     * @param channelId The channel id
     * @param messageId The id of the message to pin
     * @example await client.channels.pinMessage('channel_id', 'message_id');
     */
    async pinMessage(channelId: string, messageId: string): Promise<void> {
        await this.client.api(`/channels/${channelId}/pins`, {
            method: 'POST',
            body: {
                messageId: messageId
            }
        })

        // @ts-ignore
        if(this.client.options.cache.messages){
            const existing = this.client.cache.messages.get(messageId);
            if(existing) existing.pinned = true;
        }
    }

    /**
     * Unpin a message
     * 
     * @param channelId The channel id
     * @param messageId The id of the message to unpin
     * @example await client.channels.unpinMessage('channel_id', 'message_id');
     */
    async unpinMessage(channelId: string, messageId: string): Promise<void> {
        await this.client.api(`/channels/${channelId}/pins/${messageId}`, { method: 'DELETE' })

        // @ts-ignore
        if(this.client.options.cache.messages){
            const existing = this.client.cache.messages.get(messageId);
            if(existing) existing.pinned = false;
        }
    }

    /**
     * Get all the user direct message channels
     * @examples const channels = client.channels.getDMChannels();
     */
    async getDMChannels(): Promise<Collection<string, Channel>> {

        const [{ channels }] = await this.client.api(`/users/${this.client.user?.id}/channels`);
        const res = new Collection<string, Channel>();

        if(channels){
            // @ts-ignore
            if(this.client.options.cache.channels){
                for(let i = 0; i < channels.length; i++){
                    const channel = new Channel(channels[i], this.client);
                    res.set(channel.id, channel);
                    this.client.cache.channels.set(channel.id, channel);
                }
            } else for(let i = 0; i < channels.length; i++) res.set(channels[i].id, new Channel(channels[i], this.client));
        }

        return res;

    }

    /**
     * Create a new dm channel
     * 
     * @param ids Ids of the users to create a dm channel
     * @warning This method might not work.
     * @example await client.user.createDM('id');
     */
    async createDM(...ids: string[]): Promise<Channel> {

        let [{ channel }] = await this.client.api(`/users/${this.client.user?.id}/channels`, {
            method: 'POST',
            body: ids.map(id => ({ id }))
        });

        channel = new Channel(channel, this.client);
        // @ts-ignore
        if(this.client.options.cache.channels) this.client.cache.channels.set(channel.id, channel);
        return channel;

    }

}