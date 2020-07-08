import { RuntimeError } from "../interface/runtime-error.interface";
export declare class ObjectNotFoundError extends Error implements RuntimeError {
    statusCode: number;
    type: string;
    constructor(entityName?: string);
}
