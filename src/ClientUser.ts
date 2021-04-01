// deno-lint-ignore-file no-explicit-any

import User from "./structures/User.ts";
import type Client from "./Client.ts";
import { Device } from "./types/others.ts";
import { AboutInfo } from "./types/user.ts";

export default class ClientUser extends User {

    /**
     * The guilded api client
     */
    client: Client;

    /**
     * Users who are blocked by the current user
     */
    blockedUsers: unknown[];

    /**
     * Social links of the current user
     */
    socialLinks: unknown[];

    /**
     * Devices of the current user
     */
    devices: Device[];

    /**
     * Creates a new current user object!
     * 
     * @param data Received raw data from the guilded api!
     * @example const user = new ClientUser(data);
     */
    constructor(data: any, client: Client){
        super(data);

        this.client = client;
        this.blockedUsers = data.blockedUsers;
        this.socialLinks = data.socialLinks;
        this.devices = data.devices;
    }

    /**
     * Set status presence for yourself!
     * 
     * @param status Should be one of `online`, `dnd`, `idle` or `invisible`
     * @example await user.setStatus('dnd');
     */
    async setStatus(status: keyof typeof Statuses): Promise<void> {

        await this.client.api('/users/me/presence', {
            method: 'POST',
            body: {
                status: Statuses[status]
            }
        })

        this.userPresenceStatus = Statuses[status] as 1 | 2 | 3 | 4;

    }

    /**
     * Set username for the user
     * 
     * @param username Your new username
     * @example await user.setUsername('username');
     */
    async setUsername(username: string): Promise<void> {
        await this.modify({ name: username });
        this.name = username;
    }

    /**
     * Set avatar for the user
     * 
     * @param avatar Your new avatar
     * @example await user.setAvatar('url');
     */
    async setAvatar(avatar: string): Promise<void> {
        await this.modify({ avatar });
    }

    /**
     * Set subdomain for the user
     * 
     * @param subdomain Your new subdomain
     * @example await user.setSubdomain('subdomain');
     */
    async setSubdomain(subdomain: string): Promise<void> {
        await this.modify({ subdomain });
    }

    /**
     * Set about for the user
     * 
     * @param aboutInfo Object containing `about` and `tagline` fields
     * @example 
     * await user.setAbout({
     *     about: 'I am a cool bot',
     *     tagline: 'Bots are cool enough'
     * });
     */
    async setAbout(aboutInfo: AboutInfo): Promise<void> {
        await this.modify({ aboutInfo });
    }

    /**
     * Modify your profile with name, avatar, subdomain and aboutInfo
     * 
     * @param options Options containing all optional fields with name, avatar, subdomain, sboutInfo
     * @example await user.modify({ name: 'username' });
     */
    async modify(options: {
        name?: string;
        avatar?: string;
        subdomain?: string;
        aboutInfo?: AboutInfo;
    }): Promise<void> {
        
        await this.client.api(`/users/${this.id}/profilev2`, {
            method: 'PUT',
            body: options
        });

    }

    /**
     * Set banner for the user
     * 
     * @param url The image banner url
     * @example await client.user.setBanner('url');
     */
    async setBanner(url: string): Promise<void> {
        await this.client.api(`/users/me/profile/images/banner`, {
            method: 'POST',
            body: {
                imageUrl: url
            }
        });
    }

}

const Statuses = {
    online: 1,
    idle: 2,
    dnd: 3,
    invisible: 4
}