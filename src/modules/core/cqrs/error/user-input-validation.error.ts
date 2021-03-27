import {RuntimeError} from "../../application/error/runtime.error";

export class UserInputValidationError extends RuntimeError {

    statusCode: number = 400;

    constructor(message: string) {
        super(`Input validation: ${message}`);
    }
}