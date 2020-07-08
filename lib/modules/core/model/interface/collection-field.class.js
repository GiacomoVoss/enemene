"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionField = void 0;
const entity_field_class_1 = require("./entity-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
class CollectionField extends entity_field_class_1.EntityField {
    constructor(name, label, classGetter, foreignKey) {
        super(name, label, entity_field_type_enum_1.EntityFieldType.COLLECTION, false);
        this.name = name;
        this.label = label;
        this.classGetter = classGetter;
        this.foreignKey = foreignKey;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { class: this.classGetter().name, foreignKey: this.foreignKey });
    }
}
exports.CollectionField = CollectionField;
//# sourceMappingURL=collection-field.class.js.map