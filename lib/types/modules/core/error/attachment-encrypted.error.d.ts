import { RuntimeError } from "../interface/runtime-error.interface";
export declare class AttachmentEncryptedError extends Error implements RuntimeError {
    type: string;
    constructor(message: string);
}
