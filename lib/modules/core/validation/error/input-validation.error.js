"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidationError = void 0;
class InputValidationError extends Error {
    constructor(text) {
        super(`Validierung fehlgeschlagen${text ? "\n " + text : ""}`);
        this.statusCode = 400;
        this.type = "InputValidationError";
    }
}
exports.InputValidationError = InputValidationError;
//# sourceMappingURL=input-validation.error.js.map