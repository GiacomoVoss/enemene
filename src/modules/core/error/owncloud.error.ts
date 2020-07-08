import {RuntimeError} from "../interface/runtime-error.interface";

export class OwncloudError extends Error implements RuntimeError {

    type: string = "OwncloudError";

    constructor(message: string) {
        super("Fehler mit OwnCloud: " + message);
    }
}
