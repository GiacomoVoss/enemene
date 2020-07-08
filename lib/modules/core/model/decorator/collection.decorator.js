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
exports.Collection = void 0;
const sq = __importStar(require("sequelize-typescript"));
const model_service_1 = require("../service/model.service");
const collection_field_class_1 = require("../interface/collection-field.class");
function Collection(label, classGetter, foreignKey, onUpdate = "CASCADE", onDelete = "CASCADE") {
    return function (target, propertyKey) {
        const fields = model_service_1.ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new collection_field_class_1.CollectionField(propertyKey, label, classGetter, foreignKey);
        model_service_1.ModelService.FIELDS[target.constructor.name] = fields;
        sq.HasMany(classGetter, {
            foreignKey,
            onUpdate,
            onDelete
        })(target, propertyKey);
    };
}
exports.Collection = Collection;
//# sourceMappingURL=collection.decorator.js.map