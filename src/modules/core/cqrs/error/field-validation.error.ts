import {UserInputValidationError} from "./user-input-validation.error";

export class FieldValidationError extends UserInputValidationError {
    static REQUIRED: string = "REQUIRED";

    statusCode: number = 400;

    constructor(field: string, message: string) {
        super(`Error for field "${field}": ${message}`);
    }
}