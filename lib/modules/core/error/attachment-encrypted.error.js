"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentEncryptedError = void 0;
class AttachmentEncryptedError extends Error {
    constructor(message) {
        super(`Das PDF konnte nicht dargestellt werden: Der Anhang "${message}" ist anscheinend verschlüsselt.`);
        this.type = "AttachmentEncryptedError";
    }
}
exports.AttachmentEncryptedError = AttachmentEncryptedError;
//# sourceMappingURL=attachment-encrypted.error.js.map