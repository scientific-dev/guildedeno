// deno-lint-ignore-file no-explicit-any ban-ts-comment
import { Group, Bot, Upshell, CompactTeamMember, Ban, BanOptions, Emoji, GetEmojiOptions } from "../types/teams.ts";
import { Webhook } from "../types/others.ts";
import { CreateChannel } from "../types/channels.ts";
import Member from "./Member.ts";
import Channel from "../structures/Channel.ts";
import Role from "./Role.ts";
import type Client from "../Client.ts";
import Collection from "../utils/Collection.ts";

/**
 * Formatted guilded team object
 */
export default class Team{

    /**
     * Id of the team
     */
    id: string;

    /**
     * Name of the team
     */
    name: string;

    /**
     * Subdomain of the team
     */
    subdomain: string;

    /**
     * Icon of the team
     */
    icon: string | null;

    /**
     * Bio of the team
     */
    bio?: string;

    /**
     * User id who owns this team
     */
    ownerId: string;

    /**
     * Timezone of the team
     */
    timezone: string | null;

    /**
     * Type of the team
     */
    type: string | null;

    /**
     * Roles of the guild!
     */
    roles: Collection<string, Role>;

    /**
     * The date when the team was created at
     */
    createdAt!: Date | null;

    /**
     * Array of games of the team
     */
    games: unknown[];

    /**
     * Dash image of the team
     */
    dashImage: string | null;

    /**
     * The membership role of the team if available
     */
    membershipRole: string | null;

    /**
     * Base group of the team
     */
    baseGroup: Group;

    /**
     * Follower count of the team
     */
    followerCount: number | null;

    /**
     * Member count of the team
     */
    memberCount: number;

    /**
     * Boolean stating is the team pro or not
     */
    isPro: boolean;

    /**
     * Boolean stating is the team always show team home or not
     */
    alwaysShowTeamHome: boolean;

    /**
     * Boolean stating is the team public or not
     */
    isPublic: boolean;

    /**
     * Boolean stating is the team verified or no
     */
    isVerified: boolean;

    /**
     * Boolean stating is the team recruiting or not
     */
    isRecruiting: boolean;

    /**
     * Banner urls of the team
     */
    banner: {
        small: string | null,
        medium: string | null,
        large: string | null
    }

    /**
     * Discord guild interaction with the team
     */
    discordGuild: {
        name: string | null,
        id: string | null,
        autoSyncRoles: boolean;
    }

    /**
     * The details of yourself in the guild
     */
    me: {
        isFavorite?: boolean,
        canInvite?: boolean,
        canUpdate?: boolean,
        canManageTournaments?: boolean,
        canRegisterForTournaments?: boolean,
        isMember?: boolean,
        isAdmin?: boolean,
        isApplicant?: boolean;
        isBanned?: boolean;
        followsTeam?: boolean;
        hasInvited?: boolean;
    }

    /**
     * Measurements of the team
     */
    measurements?: {
        members: number;
        followers: number;
        recentMatches: number;
        recentMatchWins: number;
        matchmakingGameRanks: unknown[];
        recentMemberLastOnline: string | null;
        subscriptionMonthsRemaining: number | null;
        membersAddedIn: {
            lastDay: number;
            lastWeek: number;
            lastMonth: number;
        }
    }

    /**
     * Webhooks of the team. Only if available.
     */
    webhooks?: Webhook[];

    /**
     * Bots of the team. Only if available.
     */
    bots?: Bot[];

    /**
     * The members of the team
     */
    members = new Collection<string, Member>();
    hasMembersCache = false;

    insightsInfo: Record<string, unknown>;
    alphaInfo: Record<string, unknown>;
    customizationInfo: Record<string, unknown>;
    additionalGameInfo: Record<string, unknown>;
    bannerImages?: Record<string, unknown>;
    paymentInfo?: unknown;
    serverSubscriptionPlans?: unknown[];
    serverSubscriptionsGateEnabled?: boolean;
    mutedMembers?: unknown[];
    deafenedMembers?: unknown[];
    upshell?: Upshell | null;
    flair: { 
        id: number,
        amount?: number;
    }[];

    /**
     * Creates a duplicate clone of the structure;
     */
    readonly clone!: Team;

    /**
     * The main client
     */
    readonly client!: Client;

    /**
     * Creates a new formatted guilded team object
     * 
     * @param data Received raw data from guilded.
     * @example const team = new Team(data, client);
     */
    constructor(data: any, client: Client){

        this.id = data.id;
        this.name = data.name;
        this.subdomain = data.subdomain;
        this.icon = data.profilePicture;
        this.ownerId = data.ownerId;
        this.timezone = data.timezone;
        this.type = data.type;
        this.games = data.games || [];
        this.dashImage = data.teamDashImage || null;
        this.membershipRole = data.membershipRole || null;
        this.baseGroup = data.baseGroup || [];
        this.flair = data.flair;
        this.followerCount = data.followerCount;
        this.memberCount = data.memberCount;
        this.isPro = data.isPro;
        this.alwaysShowTeamHome = data.alwaysShowTeamHome;
        this.isPublic = data.isPublic;
        this.isVerified = data.isVerified;
        this.isRecruiting = data.isRecruiting;
        this.insightsInfo = data.insightsInfo;
        this.alphaInfo = data.alphaInfo;
        this.customizationInfo = data.customizationInfo;
        this.additionalGameInfo = data.additionalGameInfo;
        this.me = {};
        
        this.discordGuild = {
            name: data.discordServerName,
            id: data.discordGuildId,
            autoSyncRoles: data.autoSyncDiscordRoles
        }

        if('isFavorite' in data){
            this.me = {
                ...this.me,
                isFavorite: data.isFavorite,
                canInvite: data.canInviteMembers,
                canUpdate: data.canUpdateTeam,
                canManageTournaments: data.canManageTournaments,
                canRegisterForTournaments: data.canRegisterForTournaments,
                isMember: data.viewerIsMember,
                isAdmin: data.isAdmin
            }
        }

        this.banner = {
            small: data.homeBannerImageSm,
            medium: data.homeBannerImageMd,
            large: data.homeBannerImageLg
        }

        if('bio' in data) this.bio = data.bio;
        if('createdAt' in data) Object.defineProperty(this, 'createdAt', {
            get: () => new Date(data.createdAt)
        });

        if('measurements' in data){
            this.measurements = {
                members: data.measurements.numMembers,
                followers: data.measurements.numFollowers,
                recentMatches: data.measurements.numRecentMatches,
                recentMatchWins: data.measurements.numRecentMatchWins,
                matchmakingGameRanks: data.measurements.matchmakingGameRanks,
                subscriptionMonthsRemaining: data.measurements.subscriptionMonthsRemaining,
                recentMemberLastOnline: data.measurements.mostRecentMemberLastOnline,
                membersAddedIn: {
                    lastDay: data.measurements.numMembersAddedInLastDay,
                    lastWeek: data.measurements.numMembersAddedInLastWeek,
                    lastMonth: data.measurements.numMembersAddedInLastMonth
                }
            };

            this.bannerImages = data.bannerImages;
            this.me.followsTeam = data.userFollowsTeam;
            this.me.isApplicant = data.isUserApplicant;
            this.me.hasInvited = data.isUserInvited;
            this.me.isBanned = data.isUserBannedFromTeam;
            this.paymentInfo = data.teamPaymentInfo;
            this.serverSubscriptionPlans = data.serverSubscriptionPlans;
            this.serverSubscriptionsGateEnabled = data.serverSubscriptionsGateEnabled;
        }

        if('mutedMembers' in data){
            this.mutedMembers = data.mutedMembers;
            this.deafenedMembers = data.deafenedMembers;
        }

        if('members' in data) {
            for(let i = 0; i < data.members.length; i++) this.members.set(data.members[i].id, new Member(data.members[i]))
            this.hasMembersCache = true;
            this.webhooks = data.webhooks;
            this.bots = data.bots;
        }

        if('upshell' in data) this.upshell = data;
        this.roles = new Collection();

        Object.defineProperties(this, {
            client: { value: client },
            clone: { get: () => new Team(data, client) }
        });

        // @ts-ignore
        if(this.client.options.cache.roles) {
            for(const role in data.rolesById) {
                const roleObj = new Role(data.rolesById[role], this.client);
                this.roles.set(role, roleObj);
                this.client.cache.roles.set(role, roleObj);
            }
        } else for(const role in data.rolesById) this.roles.set(role, new Role(data.rolesById[role], this.client));

    }

    /**
     * Returns the current user as a member in the team if available
     * @readonly
     */
    get member(): Member | null {
        return this.members.get(this.client.user.id) || null;
    }

    /**
     * Returns the base role of the guild if available
     * @readonly
     */
    get baseRole(): Role | null {
        return this.roles.get('baseRole') || null;
    }

    /**
     * Returns the cache channels of the team!
     * @readonly
     */
    get channels() {
        return this.client.cache.channels.filterMap(x => x.teamId == this.id);
    }

    /**
     * Returns the cache emojis of the team!
     * @readonly
     */
    get emojis() {
        return this.client.cache.emojis.filterMap(x => x.teamId == this.id);
    }

    /**
     * Returns the cache groups of the team!
     * @readonly
     */
    get groups() {
        return this.client.cache.groups.filterMap(x => x.teamId == this.id);
    }

    /**
     * Returns the banner url of team based on the given size
     * 
     * @param size Should be one of small, large or medium
     * @example const banner = team.bannerURL('small');
     */
    bannerURL(size: 'small' | 'medium' | 'large'): string | null {
        return this.banner[size];
    }

    /**
     * Modify the team's details
     * 
     * @param options The options to implement for modifying
     * @example const updated = await team.update({ name: 'New Name' });
     */
    async modify(options: ModifyTeam): Promise<boolean> {
        const updated = await this.client.teams.modify(this.id, options);
        if(updated && options.name) this.name = options.name;
        return updated;
    }

    /**
     * Set name for the team
     * 
     * @param name The new name to set
     * @example await team.setName('New name');
     */
    setName(name: string) {
        return this.modify({ name })
    }

    /**
     * Disband the team
     * @example await team.disband('id');
     */
    disband() {
        return this.client.teams.disband(this.id);
    }

    /**
     * Returns the channels of the team
     * @example const channel = await team.getChannels();
     */
    getChannels() {
        return this.client.teams.getChannels(this.id);
    } 

    /**
     * Create a channel for the team
     * 
     * @param options Options to create the channel
     * @param groupId The group id where to create channel. If not provided, will take the baseGroup of the team.
     * @example const channel = await team.createChannel({ name: 'My new channel' });
     */
    createChannel(options: CreateChannel, groupId: string = this.baseGroup.id) {
        return this.client.teams.createChannel(this.id, groupId, options);
    }

    /**
     * Delete a channel of the team
     * 
     * @param channelId The channel id to delete
     * @param groupId The group id in which the channel else will take the base group id
     * @example await team.deleteChannel('id');
     */
    deleteChannel(channelId: string, groupId: string = this.baseGroup.id) {
        return this.client.channels.deleteChannel(this.id, groupId, channelId);
    }

    /**
     * Returns the list of member of the team (overview).
     * @example const members = await team.getMembers();
     */
    getMembers(): Promise<CompactTeamMember[]> {
        return this.client.teams.getMembers(this.id);
    }

    /**
     * Set nickname for a user
     * 
     * @param nickname The nickname to set
     * @param userId The user id to set nickname
     * @example await team.setNickname('new nickname', 'user_id');
     */
    async setNickname(nickname: string, userId: string = this.client.user.id): Promise<void> {
        await this.client.teams.setNickname(this.id, nickname, userId);
        const existing = this.members.get(userId);
        if(existing) existing.nickname = nickname;
    }

    /**
     * Reset nickname for a user
     * 
     * @param userId The user id to reset nickname
     * @example await team.resetNickname('user_id');
     */
    async resetNickname(userId: string = this.client.user.id): Promise<void> {
        await this.client.teams.resetNickname(this.id, userId);
        const existing = this.members.get(userId);
        if(existing) existing.nickname = null;
    }

    /**
     * Set team xp for a member in the team
     * 
     * @param amount The amount of xp to set
     * @param userId The guilded user id to set xp
     * @example await team.setMemberXP(25, 'user_id');
     */
    async setMemberXP(amount: number, userId: string = this.client.user.id): Promise<void> {
        await this.client.teams.setMemberXP(this.id, amount, userId);
        const existing = this.members.get(userId);
        if(existing) existing.teamXP = amount;
    }

    /**
     * Kick a member from the team
     * 
     * @param userId the guilded user id to kick
     * @example await team.kick('user_id');
     */
    async kick(userId: string): Promise<void> {
        await this.client.teams.kick(this.id, userId);
        this.members.delete(userId);
    }

    /**
     * Get the banned data of the team
     * @example const bans = await team.getBans();
     */
    getBans() {
        return this.client.teams.getBans(this.id);
    }

    /**
     * Ban the member from the team
     * 
     * @param options Options required to ban a member
     * @example 
     * await client.teams.ban({
     *     memberId: 'member_id'
     * })
     */
    async ban(options: Omit<BanOptions, 'teamId'>): Promise<void> {
        await this.client.teams.ban({ ...options, teamId: this.id });
        this.members.delete(options.memberId);
    }

    /**
     * Unban a member in the team
     * 
     * @param userId The guilded user id to ban
     * @example await team.unban('user_id');
     */
    unban(userId: string) {
        return this.client.teams.unban(this.id, userId);
    }

    /**
     * Creates and returns a invite code of the team!
     * 
     * @param options Options required to create invite
     * @example const code = await team.createInvite();
     */
    createInvite(options?: Record<'gameId', string>) {
        return this.client.teams.createInvite(this.id, options);
    }

    /**
     * Get all the emojis of a guild
     * 
     * @param options The options to configure your results
     * @example const emojis = await team.getEmojis('team_id');
     */
    getEmojis(options?: GetEmojiOptions) {
        return this.client.teams.getEmojis(this.id, options);
    }

    /**
     * Get the emoji creators of the team
     * @example const creators = await team.getEmojiCreators();
     */
    getEmojiCreators() {
        return this.client.teams.getEmojiCreators(this.id);
    }

    /**
     * Add a role to user
     * 
     * @param roleId Role id to add
     * @param userId User id to add role
     * @example await team.addRole(1000, 'user_id');
     */
    addRole(roleId: number, userId: string) {
        return this.client.teams.addRole(this.id, roleId, userId);
    }

    /**
     * Remove a role to user
     * 
     * @param roleId Role id to add
     * @param userId User id to add role
     * @example await team.removeRole(1000, 'user_id');
     */
    removeRole(roleId: number, userId: string) {
        return this.client.teams.removeRole(this.id, roleId, userId);
    }

    /**
     * Leave the team
     * @example await team.leave();
     */
    leave() {
        return this.client.teams.leave(this.id);
    }

    /**
     * Returns the get groups of the team id
     * @example const groups = await team.getGroups();
     */
    getGroups() {
        return this.client.teams.getGroups(this.id);
    }

    /**
     * Extends this team with the simplified or extended team so the information does not gets lost
     * @param instance New team object
     */
    extend(instance: Team): this {
        const clone = this.clone;
        Object.assign(this, instance);
        Object.assign(this.me, clone.me);
        return this;
    }

}

/**
 * Team modification options
 */
export interface ModifyTeam{
    name?: string;
    description?: string;
    gameId?: string;
}
