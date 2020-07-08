"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTokenError = void 0;
class InvalidTokenError extends Error {
    constructor() {
        super(`Ungültiges Token.`);
        this.type = "InvalidTokenError";
        this.statusCode = 401;
    }
}
exports.InvalidTokenError = InvalidTokenError;
//# sourceMappingURL=invalid-token.error.js.map