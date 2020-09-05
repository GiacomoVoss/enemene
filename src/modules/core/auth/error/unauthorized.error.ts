import {RuntimeError} from "../../application/error/runtime.error";

export class UnauthorizedError extends RuntimeError {

    type: string = "UnauthorizedError";
    statusCode: number = 401;

    constructor() {
        super("Unauthorized");
    }

}
