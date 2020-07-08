"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrityViolationError = void 0;
class IntegrityViolationError extends Error {
    constructor() {
        super("Diese Aktion kann zur Wahrung von Integrität (Referenzen, bereits vorliegende Daten, ...) nicht ausgeführt werden.");
        this.statusCode = 423;
        this.type = "IntegrityViolationError";
    }
}
exports.IntegrityViolationError = IntegrityViolationError;
//# sourceMappingURL=integrity-violation.error.js.map