import {RuntimeError} from "../interface/runtime-error.interface";

export class FileNotFoundError extends Error implements RuntimeError {

    statusCode: number = 404;
    type: string = "FileNotFoundError";

    constructor(message: string) {
        super("Datei nicht gefunden: " + message);
    }
}
