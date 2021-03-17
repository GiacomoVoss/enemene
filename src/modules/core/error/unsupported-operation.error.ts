import {RuntimeError} from "../application/error/runtime.error";

export class UnsupportedOperationError extends RuntimeError {

    statusCode: number = 500;
    type: string = "UnsupportedOperationError";

    constructor(message: string) {
        super(`Unsupported operation: ${message}`);
    }
}

