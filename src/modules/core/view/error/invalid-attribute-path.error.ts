import {RuntimeError} from "../../application/error/runtime.error";

export class InvalidAttributePathError extends RuntimeError {

    statusCode: number = 400;
    type: string = "InvalidAttributePathError";

    constructor(protected path: string) {
        super(`Invalid attribute path: ${path}`);
    }
}

