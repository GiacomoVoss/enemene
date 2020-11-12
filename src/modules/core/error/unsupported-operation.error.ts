import {RuntimeError} from "../application/error/runtime.error";

export class UnsupportedOperationError extends RuntimeError {

    statusCode: number = 400;
    type: string = "UnsupportedOperationError";

    constructor(message: string) {
        super(`Unsupported operation: ${message}`);
    }
}

