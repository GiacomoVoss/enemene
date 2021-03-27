import {RuntimeError} from "../../application/error/runtime.error";
import {ValidationError} from "../interface/validation-error.interface";

export class InputValidationError extends RuntimeError {

    statusCode: number = 400;
    type: string = "InputValidationError";

    constructor(protected details: ValidationError[],
                private entity: string,
                private language: string) {
        super(`Validation failed. (${entity}: ${JSON.stringify(details)})`);
    }

    toJSON(): object {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

