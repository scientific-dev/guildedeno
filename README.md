# Guildedeno

Guildedeno is a deno wrapper for guilded api! You can view the docs [here](https://doc.deno.land/https/deno.land/x/guildedeno@v1.0.0-beta/mod.ts).

> This package is not yet made completely! Make a pull request to make changes or create an issue for suggestions, bugs, etc!

## Example

```ts
import { Client } from "https://raw.githubusercontent.com/Scientific-Guy/guildedeno/master/mod.ts";

const client = new Client({
    eventHandlers: {
        ready(){
            console.log(`Bot is ready!`);
        },
        messageCreate(message){
            if(message.content == '!ping'){
                message.send(`Ping: ${Date.now() - message.createdAt.getTime()}`);
            }
        }
    },
    cache: {
        users: true, // If set, it will cache users
        teams: true // By default its set to false. Setting it to true is preferred!
    },
    ws: {
        reconnect: true // Setting it to true will reconnect to client if the connection is closed
    }
});

client.login({
    email: 'Account email',
    password: 'Account password'
});
```

> You can join the [Unofficial Guilded api support server](https://www.guilded.gg/guilded-api?i=6AXLG00A) for more doubts regarding this.

### What can guildedeno do?

- [x] Websocket api
    - [x] Receive events
        - messageCreate
        - messageUpdate
        - messageDelete
        - channelSeen
        - teamSectionSeen
        - typing
        - channelCreate (Uses system message)
        - channelRename (Uses system message)
    - [ ] Customizable (Partially customizable)
    - [x] Reconnection (Reconnection only at errors)
- [x] Get token by username and email
- [x] Send messages
- [ ] Edit messages (Not yet made)
- [x] Delete messages
- [x] Role management
- [x] Parse role permissions
- [x] Fetch teams, users, channels, messages etc
- [x] Caching (Not fully made)
    - [x] Cache only on options set
    - [ ] Cache limit (To be made)
    - [x] Customized cache collector
- [x] Request Manager
    - [ ] Has fetch offset limit 
    - [x] Has ratelimit offset limit
    - [x] Customizable fetching
- [x] Error handelling
    - [x] Seperate errors for the package
    - [x] Error event
- [x] Structures
    - [x] Classful
    - [x] Customizable (Partially customizable)
- [x] Sharding
    - [x] Shard manager
    - [ ] Guilded client api is not supported for sharding. This features is still kept for future purposes.
- [ ] Guides (No guide made yet as of the beta stage of the package)