import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class UnauthorizedError extends Error implements RuntimeError {
    type: string;
    statusCode: number;
    constructor();
}
