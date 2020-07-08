"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwncloudError = void 0;
class OwncloudError extends Error {
    constructor(message) {
        super("Fehler mit OwnCloud: " + message);
        this.type = "OwncloudError";
    }
}
exports.OwncloudError = OwncloudError;
//# sourceMappingURL=owncloud.error.js.map