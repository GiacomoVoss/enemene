"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextParameterMissingError = void 0;
class ContextParameterMissingError extends Error {
    constructor(param) {
        super(`Kontextparameter "${param}" fehlt.`);
        this.statusCode = 400;
        this.type = "ContextParameterMissingError";
    }
}
exports.ContextParameterMissingError = ContextParameterMissingError;
//# sourceMappingURL=context-parameter-missing.error.js.map