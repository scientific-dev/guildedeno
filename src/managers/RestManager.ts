// deno-lint-ignore-file no-explicit-any
import Client from "../Client.ts";
import APIError from "../utils/Error.ts";

/**
 * Options required for RestManager's fetch
 */
export interface FetchOptions{
    method?: string;
    body?: Record<string, any> | string;
}

/**
 * The object type for the rest manager.
 */
export interface RestType{
    (url: string, options?: FetchOptions): Promise<[any, Response]>;
    getToken(email: string, password: string): Promise<string | null>;
    cookies: string;
}

const sleep = (ms: number): Promise<void> => new Promise(c => setTimeout(c, ms));

/**
 * RestManager for the guilded client
 *
 * @param client Your guilded client
 * @example
 * const rest = RestManager(client);
 * await rest('/me');
 */
export default function RestManager(client: Client): RestType {

    const handleError = ((e: any) => client.emit('error', e)) || (e => { throw e });

    /**
     * Fetch api easily!
     *
     * @param url Endpoint where you have to fetch
     * @param options Options Required for fetching
     */
    const Rest: RestType = async (url: string, options?: FetchOptions): Promise<[any, Response]> => {

        const fetched = await fetch(client.constants.BaseURL + url, {
            method: options?.method || 'GET',
            body: options?.body ? JSON.stringify(options.body) : undefined,
            headers: {
                ...(client.token ?  {
                    hmac_signed_session: client.token,
                    cookie: Rest.cookies
                } : {}),
                'Content-Type': 'Application/json'
            }
        });

        if(fetched.status < 200 || fetched.status > 299){
            if(fetched.status == 429) {
                client.emit('rateLimit', fetched);
                await sleep(client.options.ratelimitOffset || 3500);
                return Rest(url, options);
            }

            throw new APIError(fetched, await fetched.text())
        }

        return [await fetched.json(), fetched];

    }

    
    Rest.cookies = '';

    Rest.getToken = async (email, password) => {
        const [_, res] = await Rest('/login', {
            method: 'POST',
            body: { email, password }
        });

        const cookies = res.headers.get('Set-Cookie');

        if(!cookies) {
            handleError(new Error('Invalid password or email provided!'));
            return null;
        }

        Rest.cookies = cookies;
        return Rest.cookies.split(' ')[0].split('=')[1].split(';')[0];
    }

    return Rest;

}