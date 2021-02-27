import {AxiosError} from "axios";

export class CommandExecutionFailedException extends Error {

    constructor(private command: string,
                private error: AxiosError) {
        super(`${command}: ${error.message + error.response.data ? ` (${JSON.stringify(error.response.data)})` : ""}`);
    }
}
