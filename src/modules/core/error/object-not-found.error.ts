import {RuntimeError} from "../interface/runtime-error.interface";

export class ObjectNotFoundError extends Error implements RuntimeError {

    statusCode: number = 404;
    type: string = "ObjectNotFoundError";

    constructor(entityName?: string) {
        super(`Object not found${entityName ? `: ${entityName}` : "."}`);
    }
}

