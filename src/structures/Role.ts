// deno-lint-ignore-file no-explicit-any

import Permissions from "../utils/Permissions.ts";
import type Client from "../Client.ts";

export default class Role{

    /**
     * Id of the role
     */
    id: number;

    /**
     * Name of the role
     */
    name: string;

    /**
     * Color of the role
     */
    color: string;

    /**
     * Priority number of the role
     */
    priority: number;

    /**
     * Permissions of the role
     */
    readonly permissions!: Permissions;

    /**
     * Boolean stating is the role base or not
     */
    isBase: boolean;

    /**
     * The id of the team where the role belongs to
     */
    teamId: string;

    /**
     * The date when the role was created at
     */
    createdAt!: Date;

    /**
     * The date when the role was updated at
     */
    updatedAt!: Date;

    /**
     * Is the role mentionable or not
     */
    isMentionable: boolean;

    /**
     * The role id in discord
     */
    discordRoleId: string | null;

    /**
     * The ms time when the role was synced at
     */
    discordSyncedAt: string | null | number;

    /**
     * Boolean stating is the role self assignable or not
     */
    isSelfAssignable: boolean;

    /**
     * Boolean stating is the role hoisted or not
     */
    isDisplayedSeparately: boolean;

    /**
     * The main guilded client
     */
    readonly client!: Client;

    /**
     * The modified guilded role object
     * 
     * @param data Received raw data from the guilded api
     * @param client The guilded client
     * @example const role = new Role(data, client);
     */
    constructor(data: any, client: Client){

        this.id = data.id;
        this.name = data.name;
        this.color = data.color;
        this.priority = data.priority;
        this.isBase = data.isBase;
        this.teamId = data.teamId;
        this.isMentionable = data.isMentionable;
        this.discordRoleId = data.discordRoleId;
        this.discordSyncedAt = data.discordSyncedAt;
        this.isSelfAssignable = data.isSelfAssignable;
        this.isDisplayedSeparately = data.isDisplayedSeparately;

        Object.defineProperty(this, 'client', { value: client });
        Object.defineProperties(this, {
            createdAt: { get: () => data.createdAt ? new Date(data.createdAt) : null },
            updatedAt: { get: () => data.updatedAt ? new Date(data.updatedAt) : null }
        })

        if('permissions' in data) this.permissions = new Permissions(data.permissions);

    }

    /**
     * The team where the role belongs to
     * @readonly
     */
    get team() {
        return this.client.teams.cache.get(this.teamId);
    }

    /**
     * Add a role to the user
     * 
     * @param userId The user id to add role
     * @example await role.addRole('user_id')
     */
    addRole(userId = this.client.user.id) {
        return this.client.teams.addRole(this.teamId, this.id, userId);
    }

     /**
     * Remove a role to the user
     * 
     * @param userId The user id to remove role
     * @example await role.removeRole('user_id')
     */
    removeRole(userId = this.client.user.id) {
        return this.client.teams.removeRole(this.teamId, this.id, userId);
    }

}