"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const object_not_found_error_1 = require("../../error/object-not-found.error");
const validation_service_1 = require("../../validation/service/validation.service");
const unauthorized_error_1 = require("../../auth/error/unauthorized.error");
const uuid_service_1 = require("../../service/uuid.service");
const model_service_1 = require("../../model/service/model.service");
const lodash_1 = require("lodash");
const collection_field_class_1 = require("../../model/interface/collection-field.class");
const reference_field_class_1 = require("../../model/interface/reference-field.class");
const composition_field_class_1 = require("../../model/interface/composition-field.class");
const many_to_many_field_class_1 = require("../../model/interface/many-to-many-field.class");
const entity_field_type_enum_1 = require("../../model/enum/entity-field-type.enum");
const enemene_1 = require("../../application/enemene");
/**
 * Service to retrieve data from the model.
 */
class DataService {
    /**
     * Counts the amount of objects of the given class based on the given options.
     * @param clazz     - The class of the objects.
     * @param options   - Optional sequelize IFindOptions.
     */
    static count(clazz, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                const countOptions = {
                    include: [],
                    distinct: true,
                    transaction: t
                };
                if (Object.keys(clazz.rawAttributes).includes("id")) {
                    countOptions.col = "id";
                }
                return clazz.count(Object.assign(Object.assign({}, options), countOptions));
            }));
        });
    }
    static findAll(clazz, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let objects = [];
            yield enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                objects = yield clazz.findAll(Object.assign(Object.assign({}, options), { nest: true, transaction: t }));
            }));
            return objects.map((object) => {
                object.$entity = clazz.name;
                return object;
            });
        });
    }
    static findNotNull(clazz, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                const object = yield clazz.findOne(Object.assign(Object.assign({}, options), { transaction: t }));
                if (!object) {
                    throw new object_not_found_error_1.ObjectNotFoundError(clazz.name);
                }
                object.$entity = clazz.name;
                return object;
            }));
        });
    }
    static findNotNullById(clazz, id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                const object = yield clazz.findByPk(id, Object.assign(Object.assign({}, options), { transaction: t }));
                if (!object) {
                    throw new object_not_found_error_1.ObjectNotFoundError(clazz.name);
                }
                object.$entity = clazz.name;
                return object;
            }));
        });
    }
    /**
     * Updates an object. Applies validation if there is some.
     *
     * @param clazz
     * @param object            - The object to update.
     * @param data              - The data to populate the object with.
     * @param validationSchema  - (optional) Validation schema.
     */
    static update(clazz, object, data, validationSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            yield enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                delete data.id;
                object.setAttributes(data);
                validation_service_1.ValidationService.validate(clazz, object);
                yield object.save({ transaction: t });
            }));
        });
    }
    /**
     * Creates an object with validation.
     *
     * @param clazz             - The class the object should be of.
     * @param data              - The data to populate the object with.
     * @param [validationSchema]- Validation schema.
     * @param [filter]          - Filter that the created object has to meet.
     */
    static create(clazz, data, validationSchema, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let object = null;
            yield enemene_1.Enemene.app.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                data.id = uuid_service_1.UuidService.getUuid();
                data.$entity = clazz.name;
                object = yield DataService.populate(data);
                validation_service_1.ValidationService.validate(clazz, object);
                yield object.save({ transaction: t });
                if (filter) {
                    const where = {};
                    clazz.primaryKeyAttributes.forEach(attribute => where[attribute] = object[attribute]);
                    const found = yield clazz.count({
                        where: Object.assign(Object.assign({}, where), filter),
                        transaction: t
                    });
                    if (found != 1) {
                        throw new unauthorized_error_1.UnauthorizedError();
                    }
                }
            }));
            return object;
        });
    }
    static populate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = enemene_1.Enemene.app.db.model(data.$entity).build({
                id: data.id,
            }, {
                isNewRecord: true,
            });
            const fields = model_service_1.ModelService.getFields(data.$entity);
            for (const [key, field] of Object.entries(fields)) {
                if (data[key]) {
                    if (field instanceof composition_field_class_1.CompositionField) {
                        const subObjectData = data[key];
                        if (subObjectData.id) {
                            const subObject = yield DataService.findNotNullById(field.classGetter(), subObjectData.id);
                            yield DataService.update(field.classGetter(), subObject, subObjectData);
                        }
                        else {
                            const subObject = yield DataService.create(field.classGetter(), subObjectData);
                            object.$set(key, subObject);
                        }
                    }
                    else if (field instanceof reference_field_class_1.ReferenceField) {
                        const referenceObject = yield DataService.findNotNullById(field.classGetter(), data[key]);
                        object.setDataValue(field.foreignKey, referenceObject.id);
                    }
                    else if (field instanceof collection_field_class_1.CollectionField) {
                        throw new Error("Cannot save collections directly.");
                    }
                    else {
                        object.setDataValue(key, data[key]);
                    }
                }
            }
            return object;
        });
    }
    static filterFields(object, requestedFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {};
            const requestedBaseFields = lodash_1.uniq(requestedFields.map((field) => field.replace(/\..*/, "")));
            const fields = Object.values(model_service_1.ModelService.FIELDS[object.$entity])
                .filter((field) => requestedBaseFields.includes(field.name) || requestedBaseFields.includes("*"));
            for (const field of fields) {
                const key = field.name;
                let value = object.getDataValue(key);
                if (field instanceof many_to_many_field_class_1.ManyToManyField || field instanceof composition_field_class_1.CompositionField || field instanceof collection_field_class_1.CollectionField || field instanceof reference_field_class_1.ReferenceField) {
                    let requestedSubFields = requestedFields
                        .filter((f) => f.startsWith(`${key}.`))
                        .map((f) => f.substr(f.indexOf(".") + 1));
                    if (!requestedSubFields.length) {
                        requestedSubFields = model_service_1.ModelService.getDisplayPatternFields(field.classGetter().name).map(field => field.name);
                    }
                    if (!value && [entity_field_type_enum_1.EntityFieldType.REFERENCE, entity_field_type_enum_1.EntityFieldType.COLLECTION].includes(field.type)) {
                        value = (yield object.$get(key));
                    }
                    if (!value) {
                        result[key] = null;
                    }
                    else if (field instanceof many_to_many_field_class_1.ManyToManyField || field instanceof collection_field_class_1.CollectionField) {
                        result[key] = yield Promise.all(value.map((v => this.filterFields(v, requestedSubFields))));
                        if (requestedSubFields.includes("$count")) {
                            result[`${key}.$count`] = value.length;
                        }
                    }
                    else if (field instanceof composition_field_class_1.CompositionField || field instanceof reference_field_class_1.ReferenceField) {
                        result[key] = yield this.filterFields(value, requestedSubFields);
                    }
                }
                else {
                    result[key] = value !== null && value !== void 0 ? value : null;
                }
            }
            result.id = object.id;
            result.$entity = object.$entity;
            result.$displayPattern = object.$displayPattern;
            return result;
        });
    }
}
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map