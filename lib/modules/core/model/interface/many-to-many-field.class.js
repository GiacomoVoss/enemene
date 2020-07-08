"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToManyField = void 0;
const entity_field_class_1 = require("./entity-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
class ManyToManyField extends entity_field_class_1.EntityField {
    constructor(name, label, classGetter, throughGetter) {
        super(name, label, entity_field_type_enum_1.EntityFieldType.COLLECTION, false);
        this.name = name;
        this.label = label;
        this.classGetter = classGetter;
        this.throughGetter = throughGetter;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { class: this.classGetter().name, through: this.throughGetter().name });
    }
}
exports.ManyToManyField = ManyToManyField;
//# sourceMappingURL=many-to-many-field.class.js.map