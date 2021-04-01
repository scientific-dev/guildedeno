// deno-lint-ignore-file ban-ts-comment

import type Client from "../Client.ts";
import { CreateChannel } from "../types/channels.ts";
import Team, { ModifyTeam } from "../structures/Team.ts";
import Channel from "../structures/Channel.ts";
import { Ban, BanOptions, CompactTeamMember, Emoji, GetEmojiOptions, Group } from "../types/teams.ts";
import Collection from "../utils/Collection.ts";

/**
 * A class which manages all the user api endpoints and the user cache
 */
export default class TeamManager{

    /**
     * A class which manages all the team api endpoints and the team cache
     * 
     * @param client Your guilded client
     * @example const manager = new TeamManager(client);
     */
    constructor(public client: Client){}

    /**
     * Returns the cache of teams
     * @readonly
     */
    get cache() {
        return this.client.cache.teams;
    }

    /**
     * Leave a team by its id
     * 
     * @param id The id of the guilded team
     * @example await client.teams.leave('id');
     */
    async leave(id: string): Promise<void> {
        await this.client.api(`/teams/${id}/members/${this.client.user.id}`, { method: 'DELETE' })
        this.client.cache.teams.delete(id);
    }

    /**
     * Check if a team name is available or not
     * 
     * @param name The name of the team
     * @example const isAvailable = await client.teams.teamNameExists('teamname');
     */
    async teamNameExists(name: string): Promise<boolean> {
        const [{ exists }] = await this.client.api(`/dryrun/teamname/${name}`);
        return exists;
    }

    /**
     * Creates a new team
     * 
     * @param name The name of the team
     * @example const team = await client.teams.create('My team');
     */
    async create(name: string): Promise<Team> {

        let [{ team }] = await this.client.api(`/teams`, {
            method: 'POST',
            body: {
                teamName: name,
                userId: this.client.user?.id
            }
        })

        team = new Team(team, this.client);
        // @ts-ignore
        if(this.client.options.cache.teams) this.client.cache.teams.set(team.id, team);
        return team;

    }

    /**
     * Get a team information by its id if available.
     * 
     * @param id The id of the guild if its available!
     * @param force If true, will search for cache first!
     * @example const team = await client.teams.get('id');
     */
    async get(id: string, force = !this.client.options.cache?.teams): Promise<Team | null> {

        if(!force){
            const existing = this.client.cache.teams.get(id);
            if(existing) return existing;
        }

        let [{ team }] = await this.client.api(`/teams/${id}`);
        
        if(team){
            team = new Team(team, this.client);

            // @ts-ignore
            if(this.client.options.cache.teams){
                const existing = this.client.cache.teams.get(id);
                if(existing) {
                    team = existing.extend(team);
                    this.client.cache.teams.set(id, team);
                    return team;
                }
                else this.client.cache.teams.set(id, team);
            }
            
            return team;
        } else return null;

    }

    /**
     * Modify the team's details
     * 
     * @param id The id of the team
     * @param options The options to implement for modifying
     * @example const updated = await client.teams.modify('id', { name: 'New Name' });
     */
    async modify(id: string, options: ModifyTeam): Promise<boolean> {

        const [{ updated }] = await this.client.api(`/teams/${id}/games/null/settings`, {
            method: 'PUT',
            body: options
        });

        if(updated){
            const existing = this.client.cache.teams.get(id);
            if(existing && options.name) existing.name = options.name;
        }

        return updated;

    }

    /**
     * Disband a team
     * 
     * @param id Id of the team
     * @example await client.teams.disband('id');
     */
    async disband(id: string): Promise<boolean> {
        const [{ success }] = await this.client.api(`/teams/${id}`, { method: 'DELETE' });
        if(success) this.client.cache.teams.delete(id);
        return success;
    }

    /**
     * Returns the channels of the team!
     * 
     * @param id The id of the team
     * @example const channels = await client.teams.getChannels('id');
     */
    async getChannels(id: string): Promise<Collection<string, Channel> | null> {

        const [{ channels }] = await this.client.api(`/teams/${id}/channels`);

        if(channels){
            const cache = new Collection<string, Channel>();

            // @ts-ignore
            if(this.client.options.cache.channels){
                for(let i = 0; i < channels.length; i++){
                    const channel = new Channel(channels[i], this.client);
                    this.client.cache.channels.set(channel.id, channel);
                    cache.set(channel.id, channel);
                }
            }else{
                for(let i = 0; i < channels.length; i++){
                    const channel = new Channel(channels[i], this.client);
                    cache.set(channel.id, channel);
                }
            }

            return cache;
        } else return null;

    }

    /**
     * Create a new channel on the team
     * 
     * @param teamId The team id
     * @param groupId The group id
     * @param options The options required to create the channel
     * @example const channel = await client.teams.createChannel('team_id', 'group_id', { name: My new channel' });
     */
    async createChannel(teamId: string, groupId: string, options: CreateChannel): Promise<Channel | null> {

        let [{ channel }] = await this.client.api(`/teams/${teamId}/groups/${groupId}/channels`, {
            method: 'POST',
            body: options
        });

        if(channel){
            channel = new Channel(channel, this.client);
            // @ts-ignore
            if(this.client.options.cache.channels) this.client.cache.channels.set(channel.id, channel);
            return channel;
        } else return null;

    }

    /**
     * Returns the list of member of the team (overview).
     * 
     * @param id The guilded team id
     * @example const members = await client.teams.getMembers('id');
     */
    async getMembers(id: string): Promise<CompactTeamMember[]> {
        const [{ members }] = await this.client.api(`/teams/${id}/members`);
        return members || [];
    }

    /**
     * Set nickname for a user
     * 
     * @param teamId The guilded team id
     * @param nickname The nickname to set
     * @param userId The user id to set nickname
     * @example await client.teams.setNickname('team_id', 'new nickname', 'user_id');
     */
    async setNickname(teamId: string, nickname: string, userId: string = this.client.user.id): Promise<void> {
        await this.client.api(`/teams/${teamId}/members/${userId}/nickname`, {
            method: 'PUT',
            body: {
                nickname
            }
        });

        const existing = this.client.cache.teams.get(teamId)?.members.get(userId);
        if(existing) existing.nickname = nickname;
    }

    /**
     * Set nickname for a user
     * 
     * @param teamId The guilded team id
     * @param userId The user id to set nickname
     * @example await client.teams.resetNickname('team_id', 'user_id');
     */
    async resetNickname(teamId: string, userId: string = this.client.user.id): Promise<void> {
        await this.client.api(`/teams/${teamId}/members/${userId}/nickname`, { method: 'DELETE' });
        const existing = this.client.cache.teams.get(teamId)?.members.get(userId);
        if(existing) existing.nickname = null;
    }

    /**
     * Set xp for a member in a team
     * 
     * @param teamId The guilded team id
     * @param amount The xp amount to set
     * @param userId The user id to set xp
     * @example await client.teams.setMemberXP('team_id', 25, 'user_id');
     */
    async setMemberXP(teamId: string, amount: number, userId: string = this.client.user.id): Promise<void> {
        await this.client.api(`/teams/${teamId}/members/${userId}/xp`, {
            method: 'PUT',
            body: { amount }
        });

        const existing = this.client.cache.teams.get(teamId)?.members.get(userId);
        if(existing) existing.teamXP = amount;
    }

    /**
     * Kick a member from the team
     * 
     * @param teamId The guilded team id
     * @param userId the guilded user id to kick
     * @example await client.teams.kick('team_id', 'user_id');
     */
    async kick(teamId: string, userId: string): Promise<void> {
        await this.client.api(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
        this.client.cache.teams.get(teamId)?.members.delete(userId);
    }

    /**
     * Get the ban data of the user
     * 
     * @param teamId The team id of to get bans
     * @example const bans = await client.teams.getBans('team_id');
     */
    async getBans(teamId: string): Promise<Ban[]> {
        const [{ bans }] = await this.client.api(`/teams/${teamId}/members/ban`);
        return bans;
    }

    /**
     * Ban the member from the team
     * 
     * @param options Options required to ban a member
     * @example 
     * await client.teams.ban({
     *     teamId: 'team_id',
     *     memberId: 'member_id'
     * })
     */
    async ban(options: BanOptions): Promise<void> {
        await this.client.api(`/teams/${options.teamId}/members/ban`, {
            method: 'DELETE',
            body: options
        });
    }

    /**
     * Unban a member in the team
     * 
     * @param teamId The guilded team id
     * @param userId The guilded user id to ban
     * @example await client.teams.ban('team_id', 'user_id');
     */
    async unban(teamId: string, userId: string): Promise<void> {
        await this.client.api(`/teams/${teamId}/members/${userId}/ban`, {
            method: 'PUT',
            body: {
                memberId: userId,
                teamId: teamId
            }
        })
    }

    /**
     * Creates and returns a invite code of the team!
     * 
     * @param teamId The guilded team id
     * @param options Options required to create invite
     * @example const code = await client.teams.createInvite('team_id');
     */
    async createInvite(teamId: string, options?: Record<'gameId', string>): Promise<string> {
        const [{ invite }] = await this.client.api(`/teams/${teamId}/invites`, {
            method: 'POST',
            body: {
                ...options,
                teamId: teamId
            }
        })

        return invite.id;
    }

    /**
     * Get all the emojis of a guild
     * 
     * @param teamId The guilded team id
     * @param options The options to configure your results
     * @example const emojis = await client.teams.getEmojis('team_id');
     */
    async getEmojis(teamId: string, options: GetEmojiOptions = {}): Promise<Collection<number, Emoji> | null> {
        const querystr = [];
        for(const key in options) querystr.push(`${key}=${options[key as keyof GetEmojiOptions]}`);
        const [emojis] = await this.client.api(`/teams/${teamId}/customReactions${
            querystr.length ? `?${querystr.join('&')}` : ''
        }`);

        if(emojis){
            const cache = new Collection<number, Emoji>();

            // @ts-ignore
            if(this.client.options.cache.emojis){
                for(let i = 0; i < emojis.length; i++) {
                    this.client.cache.emojis.set(emojis[i].id, emojis[i]);
                    cache.set(emojis[i].id, emojis[i]);
                }
            } else for(let i = 0; i < emojis.length; i++) cache.set(emojis[i].id, emojis[i]);

            return cache;
        } else return null;
    }

    /**
     * Get the emoji creators of the team
     * 
     * @param teamId The team id of emoji creators you want
     * @example const creators = await client.teams.getEmojiCreators('team_id');
     */
    async getEmojiCreators(teamId: string): Promise<string[]> {
        const [creators] = await this.client.api(`/teams/${teamId}/customReactionCreators`);
        if(creators) return creators.map((x: Record<'userId', string>) => x.userId);
        else return [];
    }

    /**
     * Adds a role to user by its id
     * 
     * @param teamId The guilded team id
     * @param roleId The guilded role id to add
     * @param userId The guilded user id
     * @example await client.teams.addRole('team_id', 'user_id', 'role_id');
     */
    async addRole(teamId: string, roleId: number, userId: string): Promise<void> {
        await this.client.api(`/teams/${teamId}/roles/${roleId}/users/${userId}`, { method: 'PUT' });
    }

    /**
     * Removes a role to user by its id
     * 
     * @param teamId The guilded team id
     * @param roleId The guilded role id to remove
     * @param userId The guilded user id
     * @example await client.teams.removeRole('team_id', 'user_id', 'role_id');
     */
    async removeRole(teamId: string, roleId: number, userId: string): Promise<void> {
        await this.client.api(`/teams/${teamId}/roles/${roleId}/users/${userId}`, { method: 'DELETE' });
    }

    /**
     * Get groups for the team
     * 
     * @param teamId The guilded team id
     * @param force If true, will force fetch else will search for cache
     * @example const groups = await client.teams.getGroups('team_id');
     */
    async getGroups(teamId: string): Promise<Collection<string, Group> | null> {

        const [{ groups }] = await this.client.api(`/teams/${teamId}/groups`);

        if(groups){
            const cache = new Collection<string, Group>();

            if(this.client.options.cache?.groups){
                for(let i = 0; i < groups.length; i++) {
                    this.client.cache.groups.set(groups[i].id, groups[i]);
                    cache.set(groups[i].id, groups[i]);
                }
            } else for(let i = 0; i < groups.length; i++) cache.set(groups[i].id, groups[i]);

            return cache;
        } else return null
    }

    /**
     * Accept the invite to join a guilded team
     * 
     * @param id The invite id
     * @example await client.teams.acceptInvite('id');
     */
    async acceptInvite(id: string): Promise<void> {
        await this.client.api(`/invites/${id}`, {
            method: 'PUT',
            body: {
                type: 'consume'
            }
        });
    }

}