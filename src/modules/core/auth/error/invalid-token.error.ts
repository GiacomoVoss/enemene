import {RuntimeError} from "../../interface/runtime-error.interface";

export class InvalidTokenError extends Error implements RuntimeError {

    type: string = "InvalidTokenError";
    statusCode: number = 401;

    constructor() {
        super(`Ungültiges Token.`);
    }
}
