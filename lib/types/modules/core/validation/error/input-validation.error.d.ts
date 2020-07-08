import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class InputValidationError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor(text: string);
}
