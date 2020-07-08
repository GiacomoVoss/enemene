"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownEntityError = void 0;
class UnknownEntityError extends Error {
    constructor(entity) {
        super(`Entität "${entity}" ist nicht bekannt.`);
        this.type = "UnknownEntityError";
    }
}
exports.UnknownEntityError = UnknownEntityError;
//# sourceMappingURL=unknown-entity.error.js.map