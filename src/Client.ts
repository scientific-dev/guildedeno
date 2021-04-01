// deno-lint-ignore-file ban-ts-comment

import RestManager from "./managers/RestManager.ts";
import type APIError from "./utils/Error.ts";
import type { GuildedGatewayError as GatewayError } from "./utils/Error.ts";
import * as Constants from "./Constants.ts";
import ClientUser from "./ClientUser.ts";
import UserManager from "./managers/UserManager.ts";
import TeamManager from "./managers/TeamManager.ts";
import ChannelManager from "./managers/ChannelManager.ts";
import WebhookManager from "./managers/WebhookManager.ts";
import Team from "./structures/Team.ts";
import type Channel from "./structures/Channel.ts";
import type Message from "./structures/Message.ts";
import type User from "./structures/User.ts";
import type Role from "./structures/Role.ts";
import { ChannelSeen, TeamSectionSeen } from "./types/events.ts";
import { UnfURLEmbed } from "./types/others.ts";
import { DeletedMessage } from "./types/messages.ts";
import type { Group, Emoji } from "./types/teams.ts";
import type { Friend } from "./types/user.ts";
import Collection from "./utils/Collection.ts";
import WSManager from "./ws/Websocket.ts";
import type { default as Shard, ShardOptions } from "./ws/Shard.ts";

/**
 * All the event handlers map for the client!
 */
export interface ClientEventMap {
    ready(): void;
    debug?: (message: string) => void;
    connect?: (shard?: Shard) => void;
    rateLimit?: (response: Response) => void;
    error?: (err: Error | APIError | GatewayError) => void;
    disconnect?: (event: CloseEvent, shard?: Shard) => void;
    messageCreate?: (message: Message, clientId?: string) => void;
    messageUpdate?: (message: Message, oldMessage?: Message, clientId?: string) => void;
    messageDelete?: (message: Message | DeletedMessage, newLastMessage?: Message, clientId?: string) => void;
    typing?: (userId: string, channelId: string) => void;
    channelSeen?: (data: ChannelSeen) => void;
    teamSectionSeen?: (data: TeamSectionSeen) => void;
    channelCreate?: (channel: string | Channel, createdBy?: User) => void;
    channelRename?: (ev: {
        channel: string | Channel,
        newName: string,
        oldName: string
    }, renamedBy?: User) => void;
    userPinged?: (clientId?: string) => void;
    unknown?: (payload: unknown) => void;
    reconnect?: (shard?: Shard) => void;
}

/**
 * All the event handler for the client events
 */
export type ClientEvents = {
    [E in keyof ClientEventMap]: ClientEventMap[E] | ClientEventMap[E][];
}

/**
 * Options required to start the guilded client!
 */
export interface ClientOptions {
    team?: string;
    ratelimitOffset?: number;
    eventHandlers: ClientEvents;
    teamShards?: string[];
    mainShardOptions?: Partial<ShardOptions>;
    cache?: {
        users?: boolean;
        teams?: boolean;
        channels?: boolean;
        friends?: boolean;
        members?: boolean;
        emojis?: boolean;
        groups?: boolean;
        messages?: boolean;
        roles?: boolean;
    };
    ws?: {
        reconnect?: boolean;
        disable?: boolean;
    };
}

/**
 * Main guilded client
 */
export default class Client {

    /**
     * Cache for the client's data
     */
    cache = {
        channels: new Collection<string, Channel>(),
        users: new Collection<string, User>(),
        teams: new Collection<string, Team>(),
        roles: new Collection<string, Role>(),
        messages: new Collection<string, Message>(),
        friends: new Collection<string, Friend>(),
        groups: new Collection<string, Group>(),
        emojis: new Collection<string, Emoji>()
    };

    /**
     * Used to simplify api requests.
     */
    api = RestManager(this);

    /**
     * All the constants for the package.
     */
    constants = Constants;

    /**
     * Used to manage websocket api.
     */
    ws!: WSManager;

    /**
     * Your guilded token.
     */
    token: string | null = null;

    /**
     * The object which contains all the details of the current user
     */
    user!: ClientUser;

    /**
     * A class to manage all user api endpoints and the user cache
     */
    users = new UserManager(this);

    /**
     * A class to manage all teams api endpoints and the teams cache
     */
    teams = new TeamManager(this);

    /**
     * A class to manage all channel api endpoints and the channels cache
     */
    channels = new ChannelManager(this);

    /**
     * A class to manage all webhook api endpoints
     */
    webhooks = new WebhookManager(this);

    /**
     * Create a new guilded client!
     * 
     * @param options Options required to start and access the guilded bot client
     * @example
     * const client = new Guilded.Client({
     *     eventHandlers: {
     *         ready(){
     *             console.log('Bot is ready!');
     *         }
     *     }
     * });
     * 
     * client.login({
     *     email: 'email',
     *     password: 'password'
     * })
     */
    constructor(public options: ClientOptions) {

        for (const [name, func] of Object.entries(options.eventHandlers)) {
            // @ts-ignore
            if (!Array.isArray(func)) options.eventHandlers[name] = [func];
        }

        this.options.cache = this.options.cache || {};
        this.options.ws = this.options.ws || {};

    }

    /**
     * Used to login to the bot account
     * 
     * @param credentials An object containing email and password fields!
     * @example
     * await client.login({
     *     email: 'email',
     *     password: 'password'
     * })
     */
    async login(credentials: {
        email: string;
        password: string;
    }): Promise<void> {

        this.emit('debug', 'Getting your api token.');
        this.token = await this.api.getToken(credentials.email, credentials.password);

        this.emit('debug', 'Fetching current user information.');
        const [{ user, teams, friends }] = await this.api('/me');
        this.user = new ClientUser(user, this);

        // @ts-ignore
        if (this.options.cache.channels) {
            this.emit('debug', 'Fetching dm channels of the current user.');
            await this.channels.getDMChannels();
        }

        // @ts-ignore
        if (this.options.cache.teams) {
            this.emit('debug', 'Resolving teams of the current user.');
            teams.forEach((x: unknown) => {
                const team = new Team(x, this);
                this.teams.cache.set(team.id, team);
            });
        }

        // @ts-ignore
        if (this.options.cache.friends) {
            this.emit('debug', 'Resolving friends of the current user');
            friends.forEach((x: Record<string, string>) => {
                const friend = {
                    userId: x.friendUserId,
                    status: x.friendStatus,
                    createdAt: x.createdAt
                }

                this.cache.friends.set(friend.userId, friend);
            })
        }

        if (!this.options.ws?.disable) {
            this.emit('debug', 'Attempting to connect to the gateway.');
            this.ws = new WSManager(this);
            await this.ws.createShard('main', this.options.mainShardOptions);
            this.emit('debug', 'Connected to the main shard.');
            if (this.options.teamShards) await Promise.all(this.options.teamShards.map(x => this.ws.createShard(x)));
        }

        this.constants = Constants;
        this.emit('ready');
        this.emit('debug', 'Client is ready.');

    }

    /**
     * Fetches the current user details
     * @example const user = await client.fetchUser();
     */
    async fetchUser(): Promise<ClientUser> {
        const [{ user }] = await this.api('/me');
        return this.user = new ClientUser(user, this);
    }

    /**
     * Set a new password for your account
     * 
     * @param password Your new password to set
     * @example await client.setPassword('password');
     */
    async setPassword(password: string): Promise<void> {
        await this.api('/users/me/password', {
            method: 'POST',
            body: { newPassword: password }
        })
    }

    /**
     * Returns the embed data of the url!
     * 
     * @param url The url of whose embed you want
     * @example const embed = await client.getEmbed('https://google.com');
     */
    async getEmbed(url: string): Promise<UnfURLEmbed> {
        return (await this.api(`/content/embed_info?url=${url}`))[0];
    }

    /**
     * A short hand method to emit events!
     * 
     * @param event Event name
     * @param data Event data to send
     * @example client.emit('debug', 'A test event!');
     */
    emit(event: keyof ClientEvents, ...data: unknown[]): void {
        // @ts-ignore
        if (this.options.eventHandlers[event]) this.options.eventHandlers[event].forEach(x => x(...data));
    }

}