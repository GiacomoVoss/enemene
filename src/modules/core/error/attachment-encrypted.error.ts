import {RuntimeError} from "../interface/runtime-error.interface";

export class AttachmentEncryptedError extends Error implements RuntimeError {

    type: string = "AttachmentEncryptedError";

    constructor(message: string) {
        super(`Das PDF konnte nicht dargestellt werden: Der Anhang "${message}" ist anscheinend verschlüsselt.`);
    }
}
