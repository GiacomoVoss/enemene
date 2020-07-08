"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentExpectedError = void 0;
class ArgumentExpectedError extends Error {
    constructor(message) {
        super("ParameterType erwartet: " + message);
        this.statusCode = 400;
        this.type = "ArgumentExpectedError";
    }
}
exports.ArgumentExpectedError = ArgumentExpectedError;
//# sourceMappingURL=argument-expected.error.js.map