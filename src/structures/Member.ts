// deno-lint-ignore-file no-explicit-any

import { 
    UserStatus, 
    UserAlias as Alias, 
    Statuses
} from "../types/user.ts";

/**
 * Formatted guilded member object
 */
export default class Member{

    /**
     * User's guilded id
     */
    id: string;

    /**
     * Username of the member
     */
    name: string;

    /**
     * Nickname of the member in the team
     */
    nickname: null | string;

    /**
     * The aliases this user might have on games
     */
    aliases: Alias[];

    /**
     * When this user joined Guilded
     */
    joinedAt!: Date | null;

    /**
     * The last date in which this user was detected online
     */
    lastOnlineAt!: Date | null;

    /**
     * Membership role of the member in the server
     */
    membershipRole: string;

    /**
     * Avatar url of the member
     */
    avatar: string;

    /**
     * Banner url of the member
     */
    banner: string;
    
    /**
     * This users steam Id
     */
    steamId: string | null;

    /**
     * The current status of this user
     */
    userStatus: UserStatus | null;

    /**
     * Status represented by an integer
     */
    userPresenceStatus: 1 | 2 | 3 | 4;

    /**
     * Team xp of the member
     */
    teamXP: number;

    stonks: number;
    roleIds: number[];
    socialLinks: unknown[];

    /**
     * Creates a new member object!
     * 
     * @param data Received raw data from the guilded api
     * @example const member = new Member(data);
     */
    constructor(data: any){

        this.id = data.id;
        this.name = data.name;
        this.aliases = data.aliases;
        this.steamId = data.steamId;
        this.userStatus = data.userStatus || null;
        this.userPresenceStatus = data.userPresenceStatus;
        this.avatar = data.profilePicture;
        this.banner = data.profileBannerBlur;
        this.teamXP = data.teamXp;
        this.stonks = data.stonks;
        this.socialLinks = data.socialLinks;
        this.membershipRole = data.membershipRole;
        this.nickname = data.nickname;
        this.roleIds = data.roleIds;

        Object.defineProperties(this, {
            joinedAt: { get: () => data.joinDate ? new Date(data.joinDate) : null },
            lastOnlineAt: { get: () => data.lastOnline ? new Date(data.lastOnline) : null }
        });

    }

    /**
     * Returns the status text of the user
     * @readonly
     */
    get status(): Statuses | 'unknown' {
        return UserStatuses[this.userPresenceStatus + 1] as Statuses || 'unknown';
    }

}

const UserStatuses = ['online', 'idle', 'dnd', 'offline'];