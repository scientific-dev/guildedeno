// deno-lint-ignore-file no-explicit-any

import type Client from "../Client.ts";
import { Reaction, CustomReaction, Mention, MessageContent } from "../types/messages.ts";
import { makeMessageContent, Collection } from "../utils/mod.ts";
import type { Embed } from "../utils/Embed.ts";

/**
 * Formatted message object
 */
export default class Message{

    /**
     * Array of mentions in the message
     */
    mentions: Collection<Mention['id'], Mention>;

    /**
     * Emojis present in the message
     */
    emojis: CustomReaction[];

    /**
     * The embeds of the message
     */
    embeds: Embed[];

    /**
     * The message id
     */
    id: string;

    /**
     * The message type
     */
    type: 'default' | 'system' | 'webhook' | 'bot';

    /**
     * The message content
     */
    content: string;

    /**
     * Array of reactions in the message
     */
    reactions: Reaction[];

    /**
     * The user id who created it
     */
    createdBy: string;

    /**
     * The date when the message was created
     */
    createdAt!: Date | null;

    /**
     * The date when the message was edited at
     */
    editedAt!: Date | null;

    /**
     * The date when the message was deleted at if it was deleted
     */
    deletedAt!: Date | null;

    /**
     * Boolean stating is the message was deleted or not
     */
    deleted: boolean;

    /**
     * The id of the channel where it was sent
     */
    channelId: string;

    /**
     * The id of the bot which created the message if it was sent by a bot
     */
    botId: string;

    /**
     * The id of the webhook which created the message if it was sent by a webhook
     */
    webhookId: string;

    /**
     * Boolean stating is the message pinned or not
     */
    pinned: boolean;

    /**
     * The id of the user who pinned the message
     */
    pinnedBy: string;

    /**
     * The id of the team where the message was created at
     */
    teamId: string | null;

    /**
     * The main guilded client
     */
    readonly client!: Client;

    /**
     * Formatted message object
     * 
     * @param data Recieved raw data from the guilded api
     * @param client The guilded client
     * @example const message = new Message(data, client);
     */
    constructor(data: any, client: Client){

        this.id = data.id;
        this.type = data.type;
        this.reactions = data.reactions || [];
        this.createdBy = data.createdBy;
        this.deleted = Boolean(data.deletedAt);
        this.channelId = data.channelId;
        this.webhookId = data.webhookId;
        this.botId = data.botId;
        this.pinned = data.isPinned;
        this.pinnedBy = data.pinnedBy;
        this.teamId = data.teamId || null;

        const { content, mentions, reactions, embeds } = makeMessageContent(data.content.document.nodes);
        this.content = content;
        this.mentions = mentions;
        this.emojis = reactions;
        this.embeds = embeds;

        Object.defineProperties(this, {
            editedAt: { get: () => data.updatedAt ? new Date(data.editedAt) : null },
            createdAt: { get: () => data.createdAt ? new Date(data.createdAt) : null },
            deletedAt: { get: () => data.deletedAt ? new Date(data.deletedAt) : null },
            client: { value: client }
        })

    }

    /**
     * Aliases for `createdBy` property
     * @readonly
     */
    get authorId(){
        return this.createdBy;
    }

    /**
     * Returns the team where the message was originated if found
     * @readonly
     */
    get team(){
        return this.client.teams.cache.get(this.teamId as string);
    }

    /**
     * Returns the author of the message
     * @readonly
     */
    get author(){
        return this.client.users.cache.get(this.createdBy);
    }

    /**
     * Returns the channel of the message
     * @readonly
     */
    get channel(){
        return this.client.channels.cache.get(this.channelId);
    }

    /**
     * Delete this message from the channel
     * @example await message.delete();
     */
    delete() {
        return this.client.channels.deleteMessage(this.channelId, this.id);
    }

    /**
     * Add reaction to a message
     * 
     * @param id The reaction id
     * @example await message.addReaction(1000);
     */
    addReaction(id: string | number) {
        return this.client.channels.addMessageReation(this.channelId, this.id, id);
    }

    /**
     * Remove reaction to a message
     * 
     * @param id The reaction id
     * @example await message.removeReaction(1000);
     */
    removeReaction(id: string | number) {
        return this.client.channels.removeMessageReation(this.channelId, this.id, id);
    }

    /**
     * Pin this message
     * @example await message.pin();
     */
    pin() {
        return this.client.channels.pinMessage(this.channelId, this.id);
    }

    /**
     * Unpin this message
     * @example await message.unpin();
     */
    unpin() {
        return this.client.channels.unpinMessage(this.channelId, this.id);
    }

    /**
     * Send message to the channel where the message was created at!
     * 
     * @param messages The message data to send
     * @example await message.send('hehe');
     */
    send(...messages: MessageContent[]) {
        return this.client.channels.sendMessage(this.channelId, ...messages);
    }

}