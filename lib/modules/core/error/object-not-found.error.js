"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectNotFoundError = void 0;
class ObjectNotFoundError extends Error {
    constructor(entityName) {
        super(`Object not found${entityName ? `: ${entityName}` : "."}`);
        this.statusCode = 404;
        this.type = "ObjectNotFoundError";
    }
}
exports.ObjectNotFoundError = ObjectNotFoundError;
//# sourceMappingURL=object-not-found.error.js.map