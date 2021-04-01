// deno-lint-ignore-file camelcase

import User from "../structures/User.ts";

/**
 * Richembed to send as message
 */
export default class RichEmbed{

    color = 0x7298da;
    file?: File;
    fields = [] as Field[];
    author?: Author;
    description?: string;
    footer?: Footer;
    image?: Image;
    timestamp?: string;
    title?: string;
    thumbnail?: Image;
    url?: string;

    /**
     * Set author for the user
     * 
     * @param name The name of the author
     * @param icon The icon of the author
     * @param url The url of the author
     */
    setAuthor(name: User | string, icon?: string, url?: string): this {
        if(name instanceof User){
            icon = name.avatar.medium || icon;
            name = name.name;
        }

        this.author = {
            name,
            icon_url: icon,
            url
        }

        return this;
    }

    /**
     * Set color for the embed
     * @param color The embed color
     */
    setColor(color: string): this {
        this.color = color == 'RANDOM' ? Math.floor(Math.random() * (0xffffff + 1)) : parseInt(color.replace('#', ''), 16)
        return this;
    }

    /**
     * Set description for the embed
     * @param description The description to set
     */
    setDescription(description: string): this {
        this.description = description; 
        return this;
    }

    /**
     * Add fields to the site
     * 
     * @param name Name of the field
     * @param value Value of the field
     * @param inline Boolean stating should the field be inline or not. Set to defaukt: true.
     */
    addField(name: string, value: string, inline = false): this {
        this.fields.push({ name, value, inline });
        return this;
    }

    /**
     * Set footer for this embed
     * 
     * @param text The text for the footer
     * @param icon The icon of the footer
     */
    setFooter(text: string, icon?: string): this {
        this.footer = { text, icon_url: icon };
        return this;
    }

    /**
     * Sets title for the embed
     * @param title The new title to set
     */
    setTitle(title: string): this {
        this.title = title;
        return this;
    }

    /**
     * Set thumbnail for the embed
     * @param url The url of the thumbnail
     */
    setThumbnail(url: string): this {
        this.thumbnail = { url };
        return this;
    }

    /**
     * Set timestamp for the embed
     * @param time The time to set for timestamp in ms
     */
    setTimestamp(time = Date.now()): this {
        this.timestamp = new Date(time).toISOString();
        return this;
    }

    /**
     * Set image for the embed
     * @param url The embed url
     */
    setImage(url: string): this {
        this.image = { url };
        return this;
    }

    /**
     * Attaches file to the embed
     * 
     * @param blob The file blob
     * @param name The name of the attachment
     */
    attachFile(blob: unknown, name: string): this {
        this.file = { blob, name };
        this.setImage(`attachment://${name}`);
        return this;
    }
    
}

/**
 * The main raw embed
 */
export interface Embed{
    color: number;
    file?: File;
    fields: Field[];
    author?: Author;
    description?: string;
    footer?: Footer;
    image?: Image;
    timestamp?: string;
    title?: string;
    thumbnail?: Image;
    url?: string;
}

/**
 * File object structure of the embed
 */
export interface File{
    blob: unknown;
    name: string;
}

/**
 * Embed author object structure
 */
export interface Author{
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

/**
 * Embed field object structure
 */
export interface Field{
    name: string;
    value: string;
    inline?: boolean;
}

/**
 * Embed footer object structure
 */
export interface Footer{
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

/**
 * Embed image object structure
 */
export interface Image{
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}