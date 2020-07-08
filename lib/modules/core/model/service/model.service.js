"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = void 0;
const entity_field_class_1 = require("../interface/entity-field.class");
const lodash_1 = require("lodash");
const many_to_many_field_class_1 = require("../interface/many-to-many-field.class");
const composition_field_class_1 = require("../interface/composition-field.class");
const collection_field_class_1 = require("../interface/collection-field.class");
const reference_field_class_1 = require("../interface/reference-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
const enemene_1 = require("../../application/enemene");
class ModelService {
    static getFields(entity) {
        return (ModelService.FIELDS[entity] || {});
    }
    static getModel(entity, requestedFields) {
        return Object.assign(Object.assign({}, this.getModelInternal(entity, requestedFields)), { $root: entity });
    }
    static getModelInternal(entity, requestedFields) {
        let result = {
            [entity]: {},
        };
        const requestedBaseFields = lodash_1.uniq(requestedFields.map((field) => field.replace(/\..*/, "")));
        const modelFields = ModelService.FIELDS[entity];
        const fields = Object.values(modelFields)
            .filter((field) => requestedBaseFields.includes(field.name) || requestedBaseFields.includes("*"));
        for (const field of fields) {
            const key = field.name;
            result[entity][field.name] = field;
            if (field instanceof many_to_many_field_class_1.ManyToManyField || field instanceof composition_field_class_1.CompositionField || field instanceof collection_field_class_1.CollectionField || field instanceof reference_field_class_1.ReferenceField) {
                let requestedSubFields = requestedFields
                    .filter((f) => f.startsWith(`${key}.`))
                    .map((f) => f.substr(f.indexOf(".") + 1));
                result = Object.assign(Object.assign({}, result), this.getModelInternal(field.classGetter().name, requestedSubFields));
            }
        }
        result[entity].id = new entity_field_class_1.EntityField("id", "ID", entity_field_type_enum_1.EntityFieldType.UUID, true);
        return result;
    }
    static getDisplayPatternFields(entity) {
        const object = enemene_1.Enemene.app.db.model(entity).build();
        let fields = [];
        const matches = object.$displayPattern.match(/\{\w+\}/g);
        if (matches) {
            fields = matches.map((token) => token.replace(/[}{]/g, ""));
        }
        return Object.values(this.getModel(object.$entity, fields)[entity]);
    }
}
exports.ModelService = ModelService;
ModelService.FIELDS = {};
//# sourceMappingURL=model.service.js.map