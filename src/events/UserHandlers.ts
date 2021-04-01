// deno-lint-ignore-file no-explicit-any

import type Client from "../Client.ts";

export function USER_PINGED(client: Client, payload: any) {
    client.emit('userPinged', payload.guildedClientId);
}

