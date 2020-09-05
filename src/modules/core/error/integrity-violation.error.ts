import {RuntimeError} from "../application/error/runtime.error";

export class IntegrityViolationError extends RuntimeError {

    statusCode: number = 423;
    type: string = "IntegrityViolationError";

    constructor() {
        super("");
    }
}

