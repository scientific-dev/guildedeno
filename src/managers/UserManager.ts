// deno-lint-ignore-file ban-ts-comment

import type Client from "../Client.ts";
import User from "../structures/User.ts";
import { Friend } from "../types/user.ts";

/**
 * A class which manages all the user api endpoints and the user cache
 */
export default class UserManager{

    /**
     * A class which manages all the user api endpoints and the user cache
     * 
     * @param client Your guilded client
     * @example const manager = new UserManager(client);
     */
    constructor(public client: Client){}

    /**
     * Returns the users cache
     * @readonly
     */
    get cache() {
        return this.client.cache.users;
    }
    
    /**
     * Fetch a user's details by its id!
     * 
     * @param id The id of the user
     * @param force If true, will force fetch instead of searching cache first
     * @example const user = await client.users.get('id');
     */
    async get(id: string, force = !this.client.options.cache?.users): Promise<User | null> {

        if(!force){
            const existing = this.cache.get(id);
            if(existing) return existing;
        }

        let [{ user }] = await this.client.api(`/users/${id}`);
        
        if(user){
            user = new User(user);
            // @ts-ignore
            if(this.client.options.cache.users) this.client.cache.users.set(user.id, user);
            return user
        } else return null;

    }

}