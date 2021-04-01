import { Webhook } from "../types/others.ts";
import Embed from "../utils/Embed.ts";
import type Client from "../Client.ts";

/**
 * A class which manages all the webhook api endpoints
 */
export default class WebhookManager{

    /**
     * A class which manages all the webhook api endpoints
     * 
     * @param client The guilded client
     * @example const manager = new WebhookManager(client);
     */
    constructor(public client: Client){}

    /**
     * Create a webhook
     * 
     * @param channelId The channel id to create
     * @param name The name of the webhook to create
     * @example const wh = await client.webhooks.create('channel_id', 'name');
     */
    async create(channelId: string, name: string): Promise<Webhook> {
        const [webhook] = await this.client.api(`/webhooks`, {
            method: 'POST',
            body: {
                channelId: channelId,
                name
            }
        });

        return webhook
    }

    /**
     * Edit a webhook
     * 
     * @param webhookId The webhook id
     * @param options The webhook options id
     * @example
     * await client.webhooks.edit('webhook_id', {
     *     name: 'New name'
     * })
     */
    async edit(webhookId: string, options: {
        name?: string,
        iconUrl?: string,
        channelId?: string
    }): Promise<Webhook> {
        const [webhook] = await this.client.api(`/webhooks/${webhookId}`, {
            method: 'PUT',
            body: options
        });

        return webhook;
    }

    /**
     * Delete a webhook in the channel
     * 
     * @param id The id of the webhook to delete
     * @example await client.webhooks.delete('webhook_id');
     */
    async delete(id: string): Promise<void> {
        await this.client.api(`/webhooks/${id}`, { method: 'DELETE' });
    }

    /**
     * Execute a webhook
     * 
     * @param id The webhook id to execute
     * @param token The webhook token
     * @param contents The contents to send
     * @example await client.webhooks.execute('id', 'token', { content: 'Hello World' });
     */
    async execute(id: string, token: string, contents: {
        content: string,
        embeds?: Embed[]
    }): Promise<void> {
        const fetched = await fetch(`https://media.guilded.gg/webhooks/${id}/${token}`, {
            method: 'POST',
            body: JSON.stringify(contents),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

}