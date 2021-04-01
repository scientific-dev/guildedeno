import type Client from "./Client.ts";
import * as ChannelHandlers from "./events/ChannelHandlers.ts";
import * as UserHandlers from "./events/UserHandlers.ts";
import * as MessageHandlers from "./events/MessageHandler.ts";

const Events: Record<string, (client: Client, payload: unknown) => unknown> = {
    ...ChannelHandlers,
    ...UserHandlers,
    ...MessageHandlers
}

export default Events;