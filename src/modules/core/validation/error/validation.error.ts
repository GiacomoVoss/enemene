import {RuntimeError} from "../../interface/runtime-error.interface";

export class ValidationError extends Error implements RuntimeError {

    statusCode: number = 400;
    type: string = "ValidationError";

    constructor(message: string) {
        super(message);
    }
}

