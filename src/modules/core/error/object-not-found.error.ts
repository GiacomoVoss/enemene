import {RuntimeError} from "../application/error/runtime.error";

export class ObjectNotFoundError extends RuntimeError {

    statusCode: number = 404;
    type: string = "ObjectNotFoundError";

    constructor(private details?: string) {
        super(`Object not found${details ? `: ${details}` : "."}`);
    }

    toJSON(): object {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

