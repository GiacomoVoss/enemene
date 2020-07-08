import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class ContextParameterMissingError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor(param: string);
}
