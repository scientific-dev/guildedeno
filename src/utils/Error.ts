/**
 * Error which is thrown only if when the packages fetches the api and it does not receives a perfect status code!
 */
export default class GuildedAPIError extends Error{

    /**
     * Error which is thrown only if when the packages fetches the api and it does not receives a perfect status code!
     * 
     * @param res The response received from the guilded api.
     * @param text The body of the request
     */
    constructor(public response: Response, text: string){
        super(`Guilded api responded ${text} with the status ${response.status} ${response.statusText}!`);
        this.name = "GuildedAPIError";
    }

}

/**
 * Error thrown when the error is related to the gateway api
 */
export class GuildedGatewayError extends Error{

    /**
     * Error thrown when the error is related to the gateway api
     * 
     * @param gatewayError The gateway error which was received
     * @param message The message to display on error
     */
    constructor(public gatewayError: ErrorEvent | Event, message: string){
        super(message);
    }

}