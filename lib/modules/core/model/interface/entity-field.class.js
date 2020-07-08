"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityField = void 0;
class EntityField {
    constructor(name, label, type, required) {
        this.name = name;
        this.label = label;
        this.type = type;
        this.required = required;
    }
    toJSON() {
        return {
            name: this.name,
            label: this.label,
            type: this.type,
            required: this.required,
        };
    }
}
exports.EntityField = EntityField;
//# sourceMappingURL=entity-field.class.js.map