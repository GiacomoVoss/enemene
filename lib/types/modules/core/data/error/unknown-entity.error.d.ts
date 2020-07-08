import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class UnknownEntityError extends Error implements RuntimeError {
    type: string;
    constructor(entity: string);
}
