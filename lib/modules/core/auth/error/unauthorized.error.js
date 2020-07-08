"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
class UnauthorizedError extends Error {
    constructor() {
        super(`Keine Berechtigung.`);
        this.type = "UnauthorizedError";
        this.statusCode = 401;
    }
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=unauthorized.error.js.map