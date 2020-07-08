import {RuntimeError} from "../../interface/runtime-error.interface";

export class InputValidationError extends Error implements RuntimeError {

    statusCode: number = 400;
    type: string = "InputValidationError";

    constructor(text: string) {
        super(`Validierung fehlgeschlagen${text ? "\n " + text : ""}`);
    }
}

