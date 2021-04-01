// deno-lint-ignore-file no-explicit-any ban-ts-comment

import { ChannelTypes, ChannelContentTypes, ModifyChannel } from "../types/channels.ts";
import Role from "./Role.ts";
import { MessageContent } from "../types/messages.ts";
import User from "./User.ts";
import Message from "./Message.ts";
import type Client from "../Client.ts";
import Collection from "../utils/Collection.ts";

/**
 * Formatted guilded Channel object
 */
export default class Channel{

    /**
     * Id of the channel
     */
    id: string;

    /**
     * Type of the channel.'
     */
    type: ChannelTypes;

    /**
     * Name of the channel.
     */
    name: string;

    /**
     * Description of the channel.
     */
    description: string;

    /**
     * List of roles that are synced with the channel
     */
    syncedRoles: unknown[] | null;

    /**
     * Object of undescript roles
     */
    roles: Collection<string, Role>;

    /**
     * Object of tournament roles
     */
    tournamentRoles: Collection<string, Role>;

    /**
     * The id of the team which the channel belongs to
     */
    teamId: string | null;

    /**
     * The main client
     */
    readonly client!: Client;

    /**
     * The channel's parent category id
     */
    categoryId: string;

    /**
     * The date when the channel was created at
     */
    createdAt!: Date | null;

    /**
     * Id of the user who created it
     */
    createdBy: string;

    /**
     * The date when the channel was updated at
     */
    updatedAt!: Date | null;

    /**
     * The content type of the channel
     */
    contentType: ChannelContentTypes;

    /**
     * The user who are participated in the voice call
     */
    voiceParticipants!: User[];

    /**
     * The id of the webhook which created the channel
     */
    createdByWebhookId?: string;

    /**
     * The id of the webhook which archived the channel
     */
    archivedByWebhookId?: string;

    /**
     * Boolean stating is the channel deleted or not
     */
    deleted: boolean;

    /**
     * The date when the channel was deleted at if it was deleted
     */
    deletedAt?: Date;

    /**
     * Parent channel id if it has one
     */
    parentChannelId?: string | number;

    /**
     * Boolean stating is the channel archived or not
     */
    archived: boolean;

    /**
     * The date when the channel was archived at
     */
    archivedAt?: Date;

    /**
     * The date when the channel was auto archived at
     */
    autoArchiveAt?: Date;

    /**
     * The id of the user who archived if the channel was archived by a user
     */
    archivedBy?: string;

    /**
     * Priority of the channel
     */
    priority: number;

    /**
     * Boolean stating is the channel is public or not
     */
    isPublic: boolean;

    /**
     * Boolean stating is the role synced or not
     */
    isRoleSynced: boolean;

    /**
     * The id of the group the channel belongs to.
     */
    groupId: string;

    userPermissions: unknown[] | null;
    userStreams: unknown[];
    settings: unknown;

    /**
     * Create a new modified channel object
     * 
     * @param data Received raw data from the guilded api
     * @param client Your guilded client
     * @example const channel = new Channel(data, client);
     */
    constructor(data: any, client: Client){
        
        this.id = data.id;
        this.type = data.type;
        this.priority = data.priority;
        this.name = data.name;
        this.description = data.description;
        this.settings = data.settings;
        this.syncedRoles = data.roles;
        this.teamId = data.teamId || null;
        this.categoryId = data.channelCategoryId;
        this.isPublic = data.isPublic;
        this.isRoleSynced = data.isRoleSynced;
        this.groupId = data.groupId;
        this.userPermissions = data.userPermissions;
        this.createdBy = data.createdBy;
        this.contentType = data.contentType;
        this.createdByWebhookId = data.createdByWebhookId;
        this.archivedByWebhookId = data.archivedByWebhookId;
        this.parentChannelId = data.parentChannelId;
        this.autoArchiveAt = data.autoArchiveAt;
        this.archivedBy = data.archivedBy; 
        this.userStreams = data.userStreams;
        this.deleted = 'deletedAt' in data;
        this.archived = 'archivedAt' in data;
        this.roles = new Collection();
        this.tournamentRoles = new Collection();
        this.voiceParticipants = [];

        Object.defineProperties(this, {
            updatedAt: { get: () => data.updatedAt ? new Date(data.updatedAt) : null },
            createdAt: { get: () => data.createdAt ? new Date(data.createdAt) : null },
            deletedAt: { get: () => data.deletedAt ? new Date(data.deletedAt) : null },
            archivedAt: { get: () => data.archivedAt ? new Date(data.archivedAt) : null },
            client: { value: client }
        })

        if('rolesById' in data){
            // @ts-ignore
            if(this.client.options.cache.roles){

                for(const role in data.rolesById) {
                    const roleObject = new Role(data.rolesById[role], this.client);
                    this.roles.set(role, roleObject);
                    this.client.cache.roles.set(role, roleObject);
                }

                for(const role in data.tournamentRolesById) {
                    const roleObject = new Role(data.tournamentRoleById[role], this.client);
                    this.tournamentRoles.set(role, roleObject);
                    this.client.cache.roles.set(role, roleObject);
                }

            } else {
                for(const role in data.rolesById) this.roles.set(role, new Role(data.rolesById[role], this.client));
                for(const role in data.tournamentRolesById) this.tournamentRoles.set(role, new Role(data.tournamentRolesById[role], this.client));
            }
        }

        if('voiceParticipants' in data) {
            // @ts-ignore
            if(this.client.options.cache.users) data.voiceParticipants.forEach((x: any) => {
                const user = new User(x);
                this.client.cache.users.set(user.id, user);
                this.voiceParticipants.push(user)
            })
            else data.voiceParticipants.forEach((x: any) => this.voiceParticipants.push(new User(x)));
        }

    }

    /**
     * Get the pinned messages of the channel
     * @readonly
     */
    get pinnedMessages() {
        return this.client.cache.messages.filterMap(x => x.channelId == this.id && x.pinned);
    }

    /**
     * The team of the channel
     * @readonly
     */
    get team() {
        return this.client.teams.cache.get(this.teamId as string);
    }

    /**
     * The parent channel of the channel
     * @readonly
     */
    get parentChannel() {
        return this.client.channels.cache.get(this.parentChannelId as string);
    }

    /**
     * Returns the messages of the guild
     * @readonly
     */
    get messages() {
        return this.client.cache.messages.filterMap(x => x.channelId == this.id);
    }

    /**
     * Edit a channel by its id
     * 
     * @param options Options required to edit channel
     * @example await channel.edit({ name: 'Rename channel' });
     */
    edit(options: ModifyChannel): Promise<void> {
        if(this.type == 'DM') throw new TypeError('Edit channel cannot be performed for team channels!');
        return this.client.channels.editChannel(this.teamId as string, this.groupId, this.id, options);
    }

    /**
     * Set a name for the channel
     * 
     * @param name Set a name for the channel
     * @example await channel.setName('new name');
     */
    async setName(name: string): Promise<void> {
        await this.edit({ name });
    }

    /**
     * Set description for the channel
     * 
     * @param description The new description
     * @example await channel.setDescription('New description');
     */
    async setDescription(description: string): Promise<void> {
        await this.edit({ description });
    }

    /**
     * Make this channel public!
     * @example await channel.makePublic();
     */
    async makePublic(): Promise<void> {
        await this.edit({ isPublic: true });
    }
    
    /**
     * Make this channel private!
     * @example await channel.makePrivate();
     */
    async makePrivate(): Promise<void> {
        await this.edit({ isPublic: false });
    }

    /**
     * Deletes this channel
     * @example await channel.delete();
     */
    delete(): Promise<void> {
        if(this.type == 'DM') throw new TypeError('Delete channel cannot be performed for team channels!');
        return this.client.channels.deleteChannel(this.teamId as string, this.groupId, this.id);
    }

    /**
     * Get all the messages of the channel
     * @example const message = await channel.getMessages();
     */
    async getMessages(): Promise<Collection<string, Message>> {
        const messages = await this.client.channels.getMessages(this.id);
        return messages ?? this.messages;
    }

    /**
     * Send messages to this channel
     * 
     * @param messages The message data to send!
     * @example const message = await channel.send('Pong!');
     */
    send(...messages: MessageContent[]) {
        return this.client.channels.sendMessage(this.id, ...messages);
    }

    /**
     * Delete a message from this channel
     * 
     * @param id The message id
     * @example await channel.deleteMessage('message_id');
     */
    deleteMessage(id: string) {
        return this.client.channels.deleteMessage(this.id, id);
    }

    /**
     * Get all pinned messages of a channel!
     * @example const pinned = await channel.getPinnedMessages();
     */
    getPinnedMessages() {
        return this.client.channels.getPinnedMessages(this.id);
    }

    /**
     * Pin a message in the channel
     * 
     * @param id The message id
     * @example await channel.pinMessage('message_id');
     */
    pinMessage(id: string) {
        return this.client.channels.pinMessage(this.id, id);
    }

    /**
     * Unpin a message in the channel
     * 
     * @param id The message id
     * @example await channel.unpinMessage('message_id');
     */
    unpinMessage(id: string) {
        return this.client.channels.unpinMessage(this.id, id);
    }

    /**
     * Create a webhook in this channel
     * 
     * @param name The name of the webhook
     * @example const wh = await channel.createWebhook('name');
     */
    createWebhook(name: string) {
        return this.client.webhooks.create(this.id, name);
    }

}