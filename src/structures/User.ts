// deno-lint-ignore-file no-explicit-any

import { 
    AboutInfo,
    UserStatus, 
    UserAlias as Alias, 
    TransientStatus,
    Statuses
} from "../types/user.ts";

/**
 * Formatted guilded user object
 */
export default class User{

    /**
     * User's guilded id
     */
    id: string;

    /**
     * Username of the current user
     */
    name: string;

    /**
     * Addition info about this user
     */
    about: AboutInfo;

    /**
     * The aliases this user might have on games
     */
    aliases: Alias[];

    /**
     * The email of this user
     */
    email: string | null;

    /**
     * When this user joined Guilded
     */
    joinedAt!: Date | null;

    /**
     * The last date in which this user was detected online
     */
    lastOnlineAt!: Date | null;

    /**
     * The moderation status of this account
     */
    moderationStatus: string | null;

    /**
     * The various styled banners belonging to this user
     */
    banner: {
        blur: string | null;
        large: string | null;
        small: string | null;
    };

    /**
     * The various styled avatars belonging to this user
     */
    avatar: {
        medium: string | null;
        blur: string | null;
        large: string | null;
        small: string | null;
    };

    /**
     * Unknown property
     */
    serviceEmail: string | null;
    
    /**
     * This users steam Id
     */
    steamId: string | null;

    /**
     * The subdomain belonging to this user
     */
    subdomain: string;

    /**
     * The current status of this user
     */
    userStatus: UserStatus | null;

    /**
     * Status represented by an integer
     */
    userPresenceStatus: 1 | 2 | 3 | 4;

    /**
     * Transient status of the user
     */
    userTransientStatus: TransientStatus | null;

    /**
     * Boolean stating that user has saw server subscriptions or not
     */
    hasSeenServerSubscriptions: boolean;

    /**
     * Boolean stating is the user account unrecoverable or not (I guess)
     */
    isUnrecoverable: boolean;

    /**
     * Server subscriptions
     */
    serverSubscriptions: unknown[];

    /**
     * Creates a new user object!
     * 
     * @param data Received raw data from the guilded api
     * @example const user = new User(data);
     */
    constructor(data: any){

        this.id = data.id;
        this.name = data.name;
        this.subdomain = data.subdomain;
        this.aliases = data.aliases;
        this.email = data.email;
        this.steamId = data.steamId;
        this.moderationStatus = data.moderationStatus;
        this.about = data.aboutInfo;
        this.serviceEmail = data.serviceEmail;
        this.userStatus = data.userStatus || null;
        this.userPresenceStatus = data.userPresenceStatus;
        this.userTransientStatus = data.userTransientStatus;
        this.hasSeenServerSubscriptions = data.hasSeenServerSubscriptions;
        this.isUnrecoverable = data.isUnrecoverable;
        this.serverSubscriptions = data.serverSubscriptions;

        this.avatar = {
            small: data.profilePictureSm || null,
            medium: data.profilePicture || null,
            large: data.profilePictureLg || null,
            blur: data.profilePictureBlur || null
        }

        this.banner = {
            small: data.profileBannerSm || null,
            large: data.profileBannerLg || null,
            blur: data.profileBannerBlur || null
        }

        Object.defineProperties(this, {
            lastOnlineAt: { get: () => data.lastOnline ? new Date(data.lastOnline) : null },
            joinedAt: { get: () => data.joinDate ? new Date(data.joinDate) : null }
        });

    }

    /**
     * Returns the status text of the user
     * @readonly
     */
    get status(): Statuses | 'unknown' {
        return UserStatuses[this.userPresenceStatus + 1] as Statuses || 'unknown';
    }

    /**
     * Creates an avatar url for the user
     * 
     * @param size The size of the avatar image you want
     * @example const avatar = user.avatarURL('small');
     */
    avatarURL(size: 'small' | 'medium' | 'large' | 'blur'): string | null {
        return this.avatar[size] || null;
    }

    /**
     * Creates an banner url for the user
     * 
     * @param size The size of the banner image you want
     * @exmaple const banner = user.bannerURL('small');
     */
    bannerURL(size: 'small' | 'large' | 'blur'): string | null {
        return this.banner[size] || null;
    }

}

const UserStatuses = ['online', 'idle', 'dnd', 'offline'];