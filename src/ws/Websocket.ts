import type Client from "../Client.ts";
import Shard, { ShardOptions } from "./Shard.ts";
import Collection from "../utils/Collection.ts";

export default class Websocket {

    shards = new Collection<string, Shard>();

    /**
     * Creates a shard manager and a websocket manager
     * 
     * @param client Your guilded client
     * @example const ws = new Websocket(client);
     */
    constructor(public client: Client) { }

    /**
     * Get the main shard
     * @readonly
     */
    get mainShard() {
        return this.shards.get('main') as Shard;
    }

    /**
     * Add a new shard
     * 
     * @param id The shard id to set
     * @param options Ths shard options to provide
     */
    async createShard(id: string, options?: Partial<ShardOptions>): Promise<Shard> {
        const shard = new Shard(id, this.client, options);
        await shard.connect();
        this.shards.set(id, shard);
        return shard;
    }

    /**
     * Close and delete a shard!
     * @param id The id of the shard to close and delete
     */
    removeShard(id: string) {
        this.shards.get(id)?.close();
        return this.shards.delete(id);
    }

    /**
     * Clear all shards!
     */
    removeAllShards() {
        this.shards.forEach(x => x.close());
        return this.shards.clear();
    }

}