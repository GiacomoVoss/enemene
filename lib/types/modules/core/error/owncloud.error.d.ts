import { RuntimeError } from "../interface/runtime-error.interface";
export declare class OwncloudError extends Error implements RuntimeError {
    type: string;
    constructor(message: string);
}
