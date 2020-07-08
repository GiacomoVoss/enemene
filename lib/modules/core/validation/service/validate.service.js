"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
const validation_error_1 = require("../error/validation.error");
class Validate {
    constructor(validationFunction) {
        this.functions = [];
        this.functions.push(validationFunction);
    }
    static notNull() {
        return new Validate((v) => {
            if (v === null || v === undefined || (typeof v === "string" && v === "")) {
                throw new validation_error_1.ValidationError("{field} darf nicht leer sein.");
            }
        });
    }
    static equals(value) {
        return new Validate((v) => {
            if (v != value) {
                throw new validation_error_1.ValidationError("{field} muss gleich \"" + value + "\" sein.");
            }
        });
    }
    notNull() {
        this.functions.push(Validate.notNull().functions[0]);
        return this;
    }
    equals(value) {
        this.functions.push(Validate.equals(value).functions[0]);
        return this;
    }
}
exports.Validate = Validate;
//# sourceMappingURL=validate.service.js.map