import {RuntimeError} from "../../interface/runtime-error.interface";

export class UnauthorizedError extends Error implements RuntimeError {

    type: string = "UnauthorizedError";
    statusCode: number = 401;

    constructor() {
        super(`Keine Berechtigung.`);
    }
}
