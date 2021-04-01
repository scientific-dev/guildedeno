// deno-lint-ignore-file no-explicit-any

import type Client from "../Client.ts";
import type { HelloTypePayload } from "../types/others.ts";
import Events from "../Events.ts";
import { GuildedGatewayError } from "../utils/Error.ts";
import { parseWSMessage as parseMessage } from "../utils/mod.ts";

/**
 * Options to create a shard
 */
export interface ShardOptions{
    teamId?: string;
    reconnect: boolean;
}

/**
 * Creates a new shard for event management
 */
export default class Shard {

    socket!: WebSocket;
    heartbeatInterval: number | null = null;
    connDetails: HelloTypePayload = {} as HelloTypePayload;
    options: ShardOptions;

    /**
     * Creates a new shard for event management
     * 
     * @param id The id of the shard to set
     * @param client The main guilded client
     * @example const shard = new Shard('main', client);
     */
    constructor(public id: string, public client: Client, options: Partial<ShardOptions> = {}) {
        this.options = {
            reconnect: Boolean(client.options.ws?.reconnect),
            ...options
        }
    }

    /**
     * Returns the state of the socket
     * @readonly
     */
    get state() {
        return this.socket?.readyState;
    }

    /**
     * Opens the connection and returns the socket when its ready to receive and send data
     */
    open(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`wss://api.guilded.gg/socket.io/?jwt=${this.client.token}&EIO=3&transport=websocket${
                this.options.teamId ? `&teamId=${this.options.teamId}` : ''
            }`);

            const callback = (message: Event | MessageEvent) => {
                const [code, data] = parseMessage(message as MessageEvent);
                if (code == 40) {
                    ws.removeEventListener('message', callback);
                    resolve(ws);
                } else if (CodeCallbacks[code]) {
                    CodeCallbacks[code](message as MessageEvent, this, [code, data])
                }
            }

            ws.addEventListener('message', callback);
        });
    }

    /**
     * Connects to the guilded gateway
     */
    async connect(): Promise<WebSocket> {
        const ws = await this.open();
        this.socket = ws;
        this.client.emit('connect');

        this.socket.onmessage = (message: MessageEvent) => {
            const [code, data] = parseMessage(message);
            const handler = CodeCallbacks[code];
            if (handler) handler(message, this, [code, data]);
        }

        this.socket.onerror = (error: ErrorEvent | Event) => {
            this.client.emit('debug', 'Error received on the gateway!');
            this.client.emit('error', new GuildedGatewayError(error, 'Unexpected error occured with the gayteway suddenly!'));
        }

        this.socket.onclose = async (event: CloseEvent) => {
            this.client.emit('debug', 'Guilded gateway api closed its socket.');
            this.client.emit('disconnect', event, this);
            this.stopHeartbeat();

            if (this.options.reconnect) {
                this.client.emit('debug', 'Reconnecting to the gateway.');
                this.socket = await this.connect();
                this.client.emit('debug', 'Reconnected to the gateway.');
                this.client.emit('reconnect', this);
            }
        }

        return ws;
    }

    /**
     * Starts sending heartbeat to the socket connection
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket.readyState == 1) {
                this.socket.send('2');
                this.client.emit('debug', 'Heartbeat sent.');
            }
        }, this.connDetails.pingInterval);
    }

    /**
     * Stops sending heartbeat to the socket api
     */
    stopHeartbeat() {
        clearInterval(this.heartbeatInterval as number);
    }

    /**
     * Closes the socket connection
     */
    close() {
        this.socket.close(1000, 'Clean close with no reconnection.');
        this.stopHeartbeat();
    }

}

const CodeCallbacks: Record<number, (message: MessageEvent, gateway: Shard, data: [number, any]) => any> = {
    0: (message: MessageEvent, gateway: Shard, [_, data]: [number, any]) => {
        gateway.client.emit('debug', 'Heartbeat started');
        gateway.connDetails = data;
        gateway.startHeartbeat();
    },
    40: (message: MessageEvent, gateway: Shard, _: [number, any]) => {
        gateway.client.emit('debug', 'Gateway sent a ready event.');
    },
    42: (message: MessageEvent, gateway: Shard, [_, [name, payload]]: [number, any]) => {
        const event = Events[name];
        if (event) event(gateway.client, payload);
        else gateway.client.emit('unknown', payload);
    }
}