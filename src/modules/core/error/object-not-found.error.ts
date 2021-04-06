import {UserInputValidationError} from "../cqrs/error/user-input-validation.error";

export class ObjectNotFoundError extends UserInputValidationError {

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

