import {UserInputValidationError} from "./user-input-validation.error";

export class CommandInputValidationError extends UserInputValidationError {
    static REQUIRED: string = "REQUIRED";

    statusCode: number = 400;

    constructor(field: string, label: string, message: string) {
        super(`Error for field "${field}" (${label}): ${message}`);
    }
}