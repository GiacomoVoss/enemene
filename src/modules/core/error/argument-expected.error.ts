import {RuntimeError} from "../interface/runtime-error.interface";

export class ArgumentExpectedError extends Error implements RuntimeError {

    statusCode: number = 400;
    type: string = "ArgumentExpectedError";

    constructor(message: string) {
        super("ParameterType erwartet: " + message);
    }
}
