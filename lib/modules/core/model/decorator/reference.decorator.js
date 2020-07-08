"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reference = void 0;
const sq = __importStar(require("sequelize-typescript"));
const sequelize_typescript_1 = require("sequelize-typescript");
const model_service_1 = require("../service/model.service");
const entity_field_class_1 = require("../interface/entity-field.class");
const reference_field_class_1 = require("../interface/reference-field.class");
const entity_field_type_enum_1 = require("../enum/entity-field-type.enum");
function Reference(label, classGetter, required = true) {
    return function (target, propertyKey) {
        const fields = model_service_1.ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new reference_field_class_1.ReferenceField(propertyKey, label, classGetter, `${propertyKey}Id`, false);
        fields[`${propertyKey}Id`] = new entity_field_class_1.EntityField(`${propertyKey}Id`, label + " ID", entity_field_type_enum_1.EntityFieldType.UUID, required);
        model_service_1.ModelService.FIELDS[target.constructor.name] = fields;
        sq.BelongsTo(classGetter, {
            foreignKey: propertyKey + "Id",
        })(target, propertyKey);
        sq.Column({
            type: sequelize_typescript_1.DataType.STRING,
            field: propertyKey + "Id",
            allowNull: !required,
        });
    };
}
exports.Reference = Reference;
//# sourceMappingURL=reference.decorator.js.map