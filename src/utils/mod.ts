// deno-lint-ignore-file no-explicit-any

import { DocumentNode, NestedNode, Content } from "../types/content.ts";
import { CustomReaction, Mention, MessageContent } from "../types/messages.ts";
import RichEmbed, { Embed } from "../utils/Embed.ts";
import Collection from "./Collection.ts";

/**
 * Parses down nodes to a string content
 * @param nodes The nodes to parse
 */
export function makeMessageContent(nodes: DocumentNode[]): {
    content: string,
    mentions: Collection<Mention['id'], Mention>,
    reactions: CustomReaction[],
    embeds: Embed[]
} {
    let content = '';
    const mentions = new Collection<Mention['id'], Mention>();
    const reactions = [];
    const embeds = [];

    for(let i = 0; i < nodes.length; i++){
        const node = nodes[i];
        for(let i = 0; i < node.nodes.length; i++){
            const n = node.nodes[i];

            if((n.data as any)?.embeds){
                embeds.push((n.data as any).embeds);
                continue;
            }

            if(n.object == 'text' && n.leaves){
                for(let i = 0; i < n.leaves.length; i++) content += n.leaves[i].text;
            } else if(n.object == 'inline'){
                if(n.type == 'mention'){
                    const mention = (n.data as any).mention;
                    content += `<@${mention.id}>`;
                    mentions.set(mention.id, mention);
                } else if(n.type == 'reaction'){
                    const reaction = (n.data as any).reaction.customReaction;
                    content += `:${reaction.name}:`;
                    reactions.push(reaction);
                }
            }
        }
    }

    return { content, mentions, reactions, embeds };
}

/**
 * Creates a message id
 */
export function createMessageId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const random = (Math.random() * 16) | 0
        return (c == 'x' ? random : ((random & 0x3) | 0x8)).toString(16);
    })
}

/**
 * Mentions utility for sending messages
 */
export const mentions = {
    user({ id, name, color = '#7298da', nickname = true, }: {
        id: string,
        name: string,
        color?: string,
        nickname?: boolean
    }){
        return this.nestedNode({
            id,
            name,
            color,
            type: 'person',
            nickname
        });
    },
    role({ id, name, color = '#7298da', nickname = true, }: {
        id: string,
        name: string,
        color?: string,
        nickname?: boolean
    }){
        return this.nestedNode({
            id,
            name,
            color,
            type: 'role',
            nickname
        });
    },
    get here(){
        return this.nestedNode({
            id: 'here',
            name: 'here',
            type: 'here',
            color: '#f5c400',
        })
    },
    get everyone(){
        return this.nestedNode({
            id: 'everyone',
            name: 'everyone',
            type: 'everyone',
            color: '#f5c400'
        })
    },
    nestedNode(obj: unknown): NestedNode {
        return {
            object: 'inline',
            type: 'mention',
            data: { mention: obj }
        }
    }
};

export function resolveMessage(...messages: MessageContent[]): Content {
    const embeds = [];
    const nodes = [] as NestedNode[];

    for(let i = 0; i < messages.length; i++){
        const message = messages[i];
        if(message instanceof RichEmbed) embeds.push(message);

        else if(typeof message == 'string') nodes.push({
            object: 'text',
            leaves: [{
                object: 'leaf',
                text: message
            }]
        } as NestedNode)

        else nodes.push(message as NestedNode);
    }

    return {
        object: 'value',
        document: {
            object: 'document',
            data: {},
            nodes: [
                {
                    object: 'block',
                    type: 'markdown-plain-text',
                    data: {},
                    nodes
                },
                {
                    object: 'block',
                    type: 'webhookMessage',
                    data: { embeds },
                    nodes: []
                }
            ]
        }
    } as Content;
}

/**
 * Parses the output from the socket data into event code and event data!
 * @param message The message event to parse
 */
export function parseWSMessage(message: MessageEvent): [number, any] {
    const data = message.data;
    let res = data;
    let code = '';

    for (let i = 0; i < data.length; i++) {
        if (isNaN(Number(data[i]))) {
            return [Number(code), JSON.parse(res)];
        }

        res = res.slice(1);
        code += data[i];
    }

    return [Number(code), res.length ? JSON.parse(res) : {}]
}

export * from "./Error.ts";
export { default as RichEmbed } from "./Embed.ts";
export * from "./Embed.ts";
export { default as GuildedAPIError } from "./Error.ts";
export * from "./Permissions.ts";
export { default as Permissions } from "./Permissions.ts";
export { Collection };