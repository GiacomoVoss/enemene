import {RuntimeError} from "../../application/error/runtime.error";

export class ForbiddenError extends RuntimeError {

    type: string = "ForbiddenError";
    statusCode: number = 403;

    constructor() {
        super("Forbidden");
    }

}
