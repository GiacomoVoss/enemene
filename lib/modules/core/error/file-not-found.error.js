"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNotFoundError = void 0;
class FileNotFoundError extends Error {
    constructor(message) {
        super("Datei nicht gefunden: " + message);
        this.statusCode = 404;
        this.type = "FileNotFoundError";
    }
}
exports.FileNotFoundError = FileNotFoundError;
//# sourceMappingURL=file-not-found.error.js.map