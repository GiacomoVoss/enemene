import { RuntimeError } from "../interface/runtime-error.interface";
export declare class FileNotFoundError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor(message: string);
}
