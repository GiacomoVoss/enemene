import { RuntimeError } from "../interface/runtime-error.interface";
export declare class IntegrityViolationError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor();
}
