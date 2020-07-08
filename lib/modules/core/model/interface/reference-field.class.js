"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceField = void 0;
const entity_field_class_1 = require("./entity-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
class ReferenceField extends entity_field_class_1.EntityField {
    constructor(name, label, classGetter, foreignKey, required) {
        super(name, label, entity_field_type_enum_1.EntityFieldType.REFERENCE, required);
        this.name = name;
        this.label = label;
        this.classGetter = classGetter;
        this.foreignKey = foreignKey;
        this.required = required;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { class: this.classGetter().name, foreignKey: this.foreignKey });
    }
}
exports.ReferenceField = ReferenceField;
//# sourceMappingURL=reference-field.class.js.map