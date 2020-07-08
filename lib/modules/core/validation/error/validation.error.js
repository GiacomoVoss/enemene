"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.type = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=validation.error.js.map