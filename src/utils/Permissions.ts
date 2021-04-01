// deno-lint-ignore-file ban-ts-comment

import { Permissions as Perms } from "../types/others.ts";

export const PermissionBits = {
    Announcements: {
        CREATE_ANNOUNCEMENTS: 1n,
        VIEW_ANNOUNCEMENTS: 2n,
        MANAGE_ANNOUNCEMENTS: 4n
    },
    Bots: {
        MANAGE_BOTS: 1n
    },
    Brackets: {
        REPORT_SCORES: 1n,
        VIEW_BRACKETS: 2n
    },
    Calendar: {
        CREATE_EVENTS: 1n,
        VIEW_EVENTS: 2n,
        MANAGE_EVENTS: 4n,
        REMOVE_EVENTS: 8n,
        EDIT_RSVP: 16n,
    },
    Chat: {
        SEND_MESSAGES: 1n,
        READ_MESSAGES: 2n,
        MANAGE_MESSAGES: 3n,
        CREATE_THREADS: 16n,
        SEND_THREAD_MESSAGE: 32n,
        MANAGE_THREADS: 64n,
    },
    Customs: {
        MANAGE_EMOJIS: 1n,
        CHANGE_NICKNAME: 16n,
        MANAGE_NICKNAME: 32n,
    },
    Docs: {
        CREATE_DOCS: 1n,
        VIEW_DOCS: 2n,
        MANAGE_DOCS: 4n,
        REMOVE_DOCS: 8n,
    },
    Form: {
        FORM_RESPONSES: 2n,
        POLL_RESULTS: 16n,
    },
    Forum: {
        CREATE_TOPICS: 1n,
        READ_FORUMS: 2n,
        MANAGE_TOPICS: 4n,
        STICKY_TOPICS: 16n,
        LOCK_TOPICS: 32n,
        CREATE_TOPIC_REPLIES: 64n,
    },
    General: {
        UPDATE_SERVER: 4n,
        INVITE_MEMBERS: 16n,
        KICK_BAN_MEMBERS: 32n,
        MANAGE_CHANNELS: 1024n,
        MANAGE_WEBHOOKS: 2048n,
        MANAGE_GROUPS: 4096n,
        MENTION_EVERYONE_HERE: 8192n,
        MANAGE_ROLES: 16384n,
    },
    List: {
        CREATE_LIST_ITEM: 1n,
        VIEW_LIST_ITEMS: 2n,
        MANAGE_LIST_ITEMS: 4n,
        REMOVE_LIST_ITEMS: 8n,
        COMPLETE_LIST_ITEMS: 16n,
        REORDER_LIST_ITEMS: 32n,
    },
    MatchMaking: {
        CREATE_SCRIMS: 1n,
        REGISTER_FOR_TOURNAMENTS: 4n,
        CREATE_TOURNAMENTS: 16n,
    },
    Media: {
        CREATE_MEDIA: 1n,
        SEE_MEDIA: 2n,
        MANAGE_MEDIA: 4n,
        REMOVE_MEDIA: 8n,
    },
    Recruitment: {
        APPROVE_APPLICATIONS: 1n,
        VIEW_APPLICATIONS: 2n,
        EDIT_APPLICATIONS: 4n,
        INDICATE_INTEREST: 16n,
        MODIFY_STATUS: 32n,
    },
    Schedule: {
        CREATE_SCHEDULE: 1n,
        VIEW_SCHEDULES: 2n,
        DELETE_SCHEDULE: 8n,
    },
    Stream: {
        ADD_STREAM: 1n,
        VIEW_STREAMS: 2n,
        JOIN_VOICE: 16n,
        SEND_MESSAGES: 32n,
    },
    Voice: {
        ADD_VOICE: 1n,
        HEAR_VOICE: 2n,
        MOVE_MEMBERS: 16n,
        PRIORITY_SPEAKER: 32n,
        VOICE_ACTIVITY: 64n,
        MUTE_MEMBER: 128n,
        DEAFEN_MEMBERS: 256n,
        MANAGE_VOICE_ROOMS: 512n,
        BROADCAST: 1024n,
        WHISPER: 2048n,
        SEND_MESSAGE: 4096n,
    }
}

export type PermissionObject = { [P in keyof PermissionBits]: keyof PermissionBits[P] };
export type PermissionBits = typeof PermissionBits;
export type PermissionStr = PermissionObject[keyof PermissionObject];
type PermissionHandlerObject = { [P in keyof PermissionBits]: PermissionHandler<P> };

export default class Permissions{

    announcements: PermissionHandler<"Announcements">;
    bots?: PermissionHandler<"Bots">;
    brackets?: PermissionHandler<"Brackets">;
    calendars: PermissionHandler<"Calendar">;
    chat: PermissionHandler<"Chat">;
    customization: PermissionHandler<"Customs">;
    docs: PermissionHandler<"Docs">;
    forms: PermissionHandler<"Form">;
    forums: PermissionHandler<"Forum">;
    general: PermissionHandler<"General">;
    list: PermissionHandler<"List">;
    matchmaking?: PermissionHandler<"MatchMaking">;
    media: PermissionHandler<"Media">;
    recruitment?: PermissionHandler<"Recruitment">;
    scheduling: PermissionHandler<"Schedule">;
    streams: PermissionHandler<"Stream">;
    voice: PermissionHandler<"Voice">;
    private handlers: PermissionHandlerObject[keyof PermissionHandlerObject][];

    constructor(public perms: Perms){
        this.announcements = PermissionSet(perms.announcements, PermissionBits.Announcements);
        this.calendars = PermissionSet(perms.calendar, PermissionBits.Calendar);
        this.chat = PermissionSet(perms.chat, PermissionBits.Chat);
        this.customization = PermissionSet(perms.customization, PermissionBits.Customs);
        this.docs = PermissionSet(perms.docs, PermissionBits.Docs);
        this.forms = PermissionSet(perms.forms, PermissionBits.Form);
        this.forums = PermissionSet(perms.forums, PermissionBits.Forum);
        this.general = PermissionSet(perms.general, PermissionBits.General);
        this.list = PermissionSet(perms.lists, PermissionBits.List);
        this.media = PermissionSet(perms.media, PermissionBits.Media);
        this.scheduling = PermissionSet(perms.scheduling, PermissionBits.Schedule);
        this.streams = PermissionSet(perms.streams, PermissionBits.Stream);
        this.voice = PermissionSet(perms.voice, PermissionBits.Voice);

        if(perms.bots) this.bots = PermissionSet(perms.bots, PermissionBits.Bots);
        if(perms.brackets) this.brackets = PermissionSet(perms.brackets, PermissionBits.Brackets);
        if(perms.recruitment) this.recruitment = PermissionSet(perms.recruitment, PermissionBits.Recruitment);
        if(perms.matchmaking) this.matchmaking = PermissionSet(perms.matchmaking, PermissionBits.MatchMaking);

        //@ts-ignore
        this.handlers = [this.voice, this.streams, this.scheduling, this.recruitment, this.matchmaking, this.announcements, this.bots, this.brackets, this.calendars, this.chat, this.customization, this.docs, this.forms, this.forums, this.general, this.list].filter(Boolean);
    }

    map(): Record<PermissionStr, boolean> {
        const record = {};
        for(const handler of this.handlers) Object.assign(record, handler.map());
        return record as Record<PermissionStr, boolean>;
    }

    toArray(): PermissionStr[] {
        const arr: PermissionStr[] = [];
        for(const handler of this.handlers) arr.push(...handler.toArray());
        return arr;
    }

    has(...permissions: PermissionStr[]): boolean {
        for(const handler of this.handlers){
            // @ts-ignore
            if(handler.has(...permissions)) return true;
        }

        return false;
    }

}

export function PermissionSet<T extends keyof PermissionBits>(bits: number, perms: PermissionBits[T]): PermissionHandler<T> {

    return {
        contains(permBits){
            return Boolean(permBits & BigInt(bits));
        },
        has(...permissions){
            return this.contains(permissions.reduce((a, b) => a |= BigInt(perms[b]), 0n));
        },
        map(){
            const record = {} as Record<string, boolean>;
            for(const [key, value] of Object.entries(perms)) record[key] = this.contains(value);
            return record as Record<keyof typeof perms, boolean>;
        },
        toArray(){
            const arr = [];

            for(const [key, value] of Object.entries(perms)){
                if(this.contains(value)) arr.push(key);
            }

            return arr as (keyof typeof perms)[];
        }
    };

}

export interface PermissionHandler<T extends keyof PermissionBits>{
    contains(bits: bigint): boolean;
    has(...permissions: (keyof PermissionBits[T])[]): boolean;
    map(): Record<keyof PermissionBits[T], boolean>;
    toArray(): (keyof PermissionBits[T])[];
}