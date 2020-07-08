"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionField = void 0;
const entity_field_class_1 = require("./entity-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
class CompositionField extends entity_field_class_1.EntityField {
    constructor(name, label, classGetter, foreignKey, required) {
        super(name, label, entity_field_type_enum_1.EntityFieldType.COMPOSITION, required);
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
exports.CompositionField = CompositionField;
//# sourceMappingURL=composition-field.class.js.map