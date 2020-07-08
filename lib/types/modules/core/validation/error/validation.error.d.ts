import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class ValidationError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor(message: string);
}
